import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { PublicUserDto, UserRole } from '@massage/shared';
import { normalizeEmail, normalizePhone, isEmailIdentifier } from '../../common/utils/normalize-contact.util';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, AuthTokensDto } from './types/auth-response.type';

@Injectable()
export class AuthService {
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
      passwordHash: await hash(dto.password, 10),
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
    const user = isEmailIdentifier(identifier)
      ? await this.usersRepository.findOne({
          where: { email: normalizeEmail(identifier) ?? undefined, isActive: true },
        })
      : await this.usersRepository.findOne({
          where: { phone: normalizePhone(identifier) ?? undefined, isActive: true },
        });

    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    if (!(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid password');
    }

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

  toPublicUser(user: User): PublicUserDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email ?? null,
      phone: user.phone ?? null,
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
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: user.role,
      gender: user.gender,
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
}
