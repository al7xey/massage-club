import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { PublicUserDto, UserGender, UserRole } from '@massage/shared';
import { normalizeEmail, normalizePhone, isEmailIdentifier } from '../../common/utils/normalize-contact.util';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, AuthTokensDto } from './types/auth-response.type';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const YANDEX_AUTH_URL = 'https://oauth.yandex.ru/authorize';
const YANDEX_TOKEN_URL = 'https://oauth.yandex.ru/token';
const YANDEX_USERINFO_URL = 'https://login.yandex.ru/info';

@Injectable()
export class AuthService {
  private readonly failedLogins = new Map<string, { count: number; lockedUntil?: number }>();

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = normalizeEmail(dto.email);
    const phone = normalizePhone(dto.phone);
    const fullName = dto.fullName.trim();

    if (!fullName) {
      throw new BadRequestException('Full name is required');
    }

    this.ensureAtLeastOneContact(email, phone);
    await this.ensureUniqueContacts(email, phone);

    const user = this.usersRepository.create({
      email,
      passwordHash: await hash(dto.password, this.configService.get<number>('BCRYPT_ROUNDS', 12)),
      fullName,
      phone,
      role: UserRole.CLIENT,
      gender: dto.gender,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.buildAuthResponse(savedUser);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const identifier = dto.identifier.trim();
    const attemptKey = normalizeLoginAttemptKey(identifier);

    this.ensureLoginIsNotLocked(attemptKey);

    const user = isEmailIdentifier(identifier)
      ? await this.usersRepository.findOne({
          where: { email: normalizeEmail(identifier) ?? undefined, isActive: true },
        })
      : await this.usersRepository.findOne({
          where: { phone: normalizePhone(identifier) ?? undefined, isActive: true },
        });

    if (!user) {
      this.recordFailedLogin(attemptKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await compare(dto.password, user.passwordHash))) {
      this.recordFailedLogin(attemptKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.failedLogins.delete(attemptKey);
    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
      });
      const user = await this.usersRepository.findOne({ where: { id: payload.sub, isActive: true } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout() {
    return { success: true };
  }

  getYandexAuthorizationUrl(returnTo?: string): string {
    const clientId = this.getRequiredYandexConfig('YANDEX_CLIENT_ID');
    const redirectUri = this.getYandexRedirectUri();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: encodeOAuthState(returnTo),
    });

    return `${YANDEX_AUTH_URL}?${params.toString()}`;
  }

  async loginWithYandexCode(code?: string): Promise<AuthResponseDto> {
    if (!code?.trim()) {
      throw new BadRequestException('Yandex authorization code is required');
    }

    const clientId = this.getRequiredYandexConfig('YANDEX_CLIENT_ID');
    const clientSecret = this.getRequiredYandexConfig('YANDEX_CLIENT_SECRET');
    const redirectUri = this.getYandexRedirectUri();
    const tokenResponse = await fetch(YANDEX_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Yandex authorization failed');
    }

    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenPayload.access_token) {
      throw new UnauthorizedException('Yandex did not return access token');
    }

    const userInfoResponse = await fetch(`${YANDEX_USERINFO_URL}?format=json`, {
      headers: { authorization: `OAuth ${tokenPayload.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new UnauthorizedException('Yandex profile request failed');
    }

    const yandexUser = (await userInfoResponse.json()) as {
      default_email?: string;
      default_phone?: { id?: number; number?: string };
      display_name?: string;
      emails?: string[];
      first_name?: string;
      id?: string;
      last_name?: string;
      login?: string;
      phones?: Array<{ id?: number; number?: string }>;
      real_name?: string;
      sex?: string;
    };
    const yandexId = yandexUser.id?.trim();
    const email = normalizeEmail(yandexUser.default_email ?? yandexUser.emails?.[0]);
    const phone = normalizePhone(yandexUser.default_phone?.number ?? yandexUser.phones?.[0]?.number);

    if (!yandexId) {
      throw new UnauthorizedException('Yandex did not return user id');
    }

    let user = await this.usersRepository.findOne({ where: { yandexId } });
    if (!user && email) {
      user = await this.usersRepository.findOne({ where: { email } });
    }
    if (!user && phone) {
      user = await this.usersRepository.findOne({ where: { phone } });
    }

    const fullName = getYandexDisplayName(yandexUser, email);
    const gender = getYandexGender(yandexUser.sex);

    if (!user) {
      user = this.usersRepository.create({
        email,
        fullName,
        gender: gender ?? UserGender.FEMALE,
        passwordHash: await hash(randomUUID(), this.configService.get<number>('BCRYPT_ROUNDS', 12)),
        phone,
        role: UserRole.CLIENT,
        yandexId,
      });
    } else {
      user.email = user.email ?? email;
      user.fullName = user.fullName || fullName;
      user.phone = user.phone ?? phone;
      user.gender = gender ?? user.gender;
      user.isActive = true;
      user.yandexId = user.yandexId ?? yandexId;
    }

    const savedUser = await this.usersRepository.save(user);
    return this.buildAuthResponse(savedUser);
  }

  buildOAuthCallbackHtml(authResponse: AuthResponseDto, state?: string) {
    const returnTo = resolveOAuthReturnTo(state);
    const redirectUrl = `${this.getPublicAppUrl()}${returnTo}`;
    const payload = JSON.stringify({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      redirectUrl,
    }).replace(/</g, '\\u003c');

    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RelaxUp</title></head><body><script>
      const payload = ${payload};
      localStorage.setItem('massageClub.accessToken', payload.accessToken);
      localStorage.setItem('massageClub.refreshToken', payload.refreshToken);
      window.location.replace(payload.redirectUrl);
    </script></body></html>`;
  }

  toPublicUser(user: User): PublicUserDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email ?? null,
      phone: user.phone ?? null,
      avatarUrl: user.avatarUrl ?? null,
      role: user.role,
      gender: user.gender,
    };
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const tokens = await this.issueTokens(user);
    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const payload = {
      sub: user.id,
      role: user.role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private ensureAtLeastOneContact(email: null | string, phone: null | string) {
    if (!email && !phone) {
      throw new BadRequestException('Email or phone is required');
    }
  }

  private async ensureUniqueContacts(email: null | string, phone: null | string, currentUserId?: string) {
    if (email) {
      const existingByEmail = await this.usersRepository.findOne({ where: { email } });
      if (existingByEmail && existingByEmail.id !== currentUserId) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (phone) {
      const existingByPhone = await this.usersRepository.findOne({ where: { phone } });
      if (existingByPhone && existingByPhone.id !== currentUserId) {
        throw new ConflictException('User with this phone already exists');
      }
    }
  }

  private ensureLoginIsNotLocked(attemptKey: string) {
    const attempt = this.failedLogins.get(attemptKey);
    if (!attempt?.lockedUntil) {
      return;
    }

    if (attempt.lockedUntil <= Date.now()) {
      this.failedLogins.delete(attemptKey);
      return;
    }

    throw new UnauthorizedException('Too many failed login attempts. Try again later.');
  }

  private recordFailedLogin(attemptKey: string) {
    const current = this.failedLogins.get(attemptKey);
    const count = (current?.count ?? 0) + 1;
    const lockedUntil = count >= MAX_FAILED_LOGIN_ATTEMPTS ? Date.now() + LOGIN_LOCK_MS : undefined;
    this.failedLogins.set(attemptKey, { count, lockedUntil });
  }

  private getYandexRedirectUri() {
    const explicitRedirectUri = this.configService.get<string>('YANDEX_REDIRECT_URI');
    if (explicitRedirectUri?.trim()) {
      const redirectUri = explicitRedirectUri.trim();
      if (redirectUri.endsWith('/api/auth/yandex/callback')) {
        const publicAppUrl = this.getPublicAppUrl();
        if (publicAppUrl === 'https://relaxup.ru' || publicAppUrl === 'https://www.relaxup.ru') {
          return `${publicAppUrl}/account`;
        }
      }

      return redirectUri;
    }

    const publicAppUrl = this.getPublicAppUrl();
    if (publicAppUrl === 'https://relaxup.ru' || publicAppUrl === 'https://www.relaxup.ru') {
      return `${publicAppUrl}/account`;
    }

    const publicApiBaseUrl = this.configService.get<string>('PUBLIC_API_BASE_URL')?.trim() || 'http://localhost:3000/api';
    return `${publicApiBaseUrl.replace(/\/$/, '')}/auth/yandex/callback`;
  }

  private getPublicAppUrl() {
    const explicitAppUrl = this.configService.get<string>('PUBLIC_APP_URL')?.trim();
    if (explicitAppUrl) {
      return explicitAppUrl.replace(/\/$/, '');
    }

    const firstCorsOrigin = this.configService.get<string>('CORS_ORIGIN')?.split(',')[0]?.trim();
    return (firstCorsOrigin || 'http://localhost:5173').replace(/\/$/, '');
  }

  private getRequiredYandexConfig(key: 'YANDEX_CLIENT_ID' | 'YANDEX_CLIENT_SECRET') {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new BadRequestException('Yandex OAuth is not configured');
    }

    return value;
  }
}

function normalizeLoginAttemptKey(identifier: string) {
  return identifier.trim().toLowerCase();
}

function encodeOAuthState(returnTo?: string) {
  return Buffer.from(JSON.stringify({ returnTo: normalizeReturnTo(returnTo) })).toString('base64url');
}

function resolveOAuthReturnTo(state?: string) {
  if (!state) {
    return '/account';
  }

  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { returnTo?: string };
    return normalizeReturnTo(parsed.returnTo);
  } catch {
    return '/account';
  }
}

function normalizeReturnTo(value?: string) {
  const trimmedValue = value?.trim() || '/account';
  return trimmedValue.startsWith('/') && !trimmedValue.startsWith('//') ? trimmedValue : '/account';
}

function getYandexDisplayName(
  user: { display_name?: string; first_name?: string; last_name?: string; login?: string; real_name?: string },
  email?: null | string,
) {
  return (
    user.real_name?.trim() ||
    [user.first_name, user.last_name].map((part) => part?.trim()).filter(Boolean).join(' ') ||
    user.display_name?.trim() ||
    user.login?.trim() ||
    email?.split('@')[0] ||
    'Гость RelaxUp'
  );
}

function getYandexGender(value?: null | string) {
  const normalizedValue = value?.trim().toLowerCase();
  if (normalizedValue === 'male' || normalizedValue === 'm') {
    return UserGender.MALE;
  }

  if (normalizedValue === 'female' || normalizedValue === 'f') {
    return UserGender.FEMALE;
  }

  return null;
}
