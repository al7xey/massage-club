import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @Get('yandex')
  yandex(@Query('returnTo') returnTo: string | undefined, @Res() response: Response) {
    response.redirect(this.authService.getYandexAuthorizationUrl(returnTo));
  }

  @Get('yandex/callback')
  async yandexCallback(@Query('code') code: string | undefined, @Query('state') state: string | undefined, @Res() response: Response) {
    const authResponse = await this.authService.loginWithYandexCode(code);
    response.type('html').send(this.authService.buildOAuthCallbackHtml(authResponse, state));
  }
}
