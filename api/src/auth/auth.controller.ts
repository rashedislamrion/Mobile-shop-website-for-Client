import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('customer/register')
  async registerCustomer(@Body() dto: RegisterCustomerDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.registerCustomer(dto);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('customer/login')
  async loginCustomer(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.loginCustomer(dto);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('staff/login')
  async loginStaff(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.loginStaff(dto);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefreshToken = req.cookies?.['refresh_token'];
    const { accessToken, refreshToken } = await this.authService.refreshTokens(oldRefreshToken);
    this.setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @CurrentUser('sub') userId: string) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken, userId);
    }
    res.clearCookie('refresh_token');
    return { success: true };
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser('sub') userId: string,
    @CurrentUser('userType') userType: 'STAFF' | 'CUSTOMER',
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, userType, dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  async getMe(@CurrentUser('sub') userId: string, @CurrentUser('userType') userType: 'STAFF' | 'CUSTOMER') {
    return this.authService.getMe(userId, userType);
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
