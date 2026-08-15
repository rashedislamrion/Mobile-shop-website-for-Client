import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshToken } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registerCustomer(dto: RegisterCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (existing) {
      throw new BadRequestException('Email or phone already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
    });

    return this.generateTokens(customer.id, 'CUSTOMER');
  }

  async loginCustomer(dto: LoginDto) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email: dto.emailOrPhone }, { phone: dto.emailOrPhone }],
      },
    });

    if (!customer) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(customer.id, 'CUSTOMER');
  }

  async loginStaff(dto: LoginDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!staff) throw new UnauthorizedException('Invalid credentials');

    if (staff.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is inactive. Contact administrator.');
    }

    const isValid = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(staff.id, 'STAFF', staff.roleId, staff.role?.name, staff.branchId);
  }

  async refreshTokens(refreshToken: string) {
    let decoded;
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const allTokensForUser = await this.prisma.refreshToken.findMany({
      where: {
        OR: [
          { staffId: decoded.sub },
          { customerId: decoded.sub }
        ],
        revoked: false
      },
    });

    let matchedToken: RefreshToken | null = null;
    for (const t of allTokensForUser) {
      if (await bcrypt.compare(refreshToken, t.tokenHash)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken || matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revoked: true },
    });

    return this.generateTokens(decoded.sub, decoded.userType, decoded.roleId, decoded.roleName, decoded.branchId);
  }

  async logout(refreshToken: string, userId: string) {
    const allTokensForUser = await this.prisma.refreshToken.findMany({
      where: {
        OR: [
          { staffId: userId },
          { customerId: userId }
        ],
        revoked: false
      },
    });

    for (const t of allTokensForUser) {
      if (await bcrypt.compare(refreshToken, t.tokenHash)) {
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revoked: true },
        });
        break;
      }
    }
    return { success: true };
  }

  async changePassword(userId: string, userType: 'STAFF' | 'CUSTOMER', dto: ChangePasswordDto) {
    if (userType === 'STAFF') {
      const user = await this.prisma.staff.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      
      const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isValid) throw new BadRequestException('Incorrect current password');

      const passwordHash = await bcrypt.hash(dto.newPassword, 10);
      await this.prisma.staff.update({
        where: { id: userId },
        data: { passwordHash },
      });
    } else {
      const user = await this.prisma.customer.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      
      const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isValid) throw new BadRequestException('Incorrect current password');

      const passwordHash = await bcrypt.hash(dto.newPassword, 10);
      await this.prisma.customer.update({
        where: { id: userId },
        data: { passwordHash },
      });
    }

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    let userId: string;
    let userType: 'STAFF' | 'CUSTOMER';

    const staff = await this.prisma.staff.findUnique({ where: { email: dto.email } });
    if (staff) {
      userId = staff.id;
      userType = 'STAFF';
    } else {
      const customer = await this.prisma.customer.findUnique({ where: { email: dto.email } });
      if (customer) {
        userId = customer.id;
        userType = 'CUSTOMER';
      } else {
        return { success: true, message: 'If an account exists, a reset link will be sent.' };
      }
    }

    const { randomBytes } = await import('crypto');
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const record = await this.prisma.passwordResetToken.create({
      data: {
        userId,
        userType,
        tokenHash,
        expiresAt,
      },
    });

    const resetToken = `${record.id}.${rawToken}`;

    return { 
      success: true, 
      resetToken
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const parts = dto.token.split('.');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid token format');
    }
    const [tokenId, rawToken] = parts;

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { id: tokenId },
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const isValid = await bcrypt.compare(rawToken, record.tokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    if (record.userType === 'STAFF') {
      await this.prisma.staff.update({
        where: { id: record.userId },
        data: { passwordHash },
      });
    } else {
      await this.prisma.customer.update({
        where: { id: record.userId },
        data: { passwordHash },
      });
    }

    await this.prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    return { success: true };
  }

  async getMe(userId: string, userType: 'STAFF' | 'CUSTOMER') {
    if (userType === 'STAFF') {
      const staff = await this.prisma.staff.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: { permissions: true }
          },
          branch: true,
        },
      });
      if (staff) delete (staff as any).passwordHash;
      return staff;
    } else {
      const customer = await this.prisma.customer.findUnique({
        where: { id: userId },
      });
      if (customer) delete (customer as any).passwordHash;
      return customer;
    }
  }

  private async generateTokens(userId: string, userType: 'STAFF' | 'CUSTOMER', roleId?: string, roleName?: string, branchId?: string | null) {
    const payload: JwtPayload = { sub: userId, userType, roleId, roleName, branchId };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET') || 'access-secret',
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRY') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY') || '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        staffId: userType === 'STAFF' ? userId : null,
        customerId: userType === 'CUSTOMER' ? userId : null,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
