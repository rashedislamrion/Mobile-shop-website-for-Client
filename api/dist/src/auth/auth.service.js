"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    failedAttempts = new Map();
    checkFailedAttempts(identifier) {
        const key = identifier.toLowerCase().trim();
        const record = this.failedAttempts.get(key);
        if (!record)
            return;
        const now = Date.now();
        if (record.lockedUntil && now < record.lockedUntil) {
            const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
            throw new common_1.HttpException(`Too many failed login attempts. Account temporarily locked out. Please try again in ${remainingSeconds}s.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (now - record.firstAttemptAt > 60000 && !record.lockedUntil) {
            this.failedAttempts.delete(key);
        }
    }
    recordFailedAttempt(identifier) {
        const key = identifier.toLowerCase().trim();
        const now = Date.now();
        const record = this.failedAttempts.get(key) || { count: 0, firstAttemptAt: now };
        if (now - record.firstAttemptAt > 60000 && (!record.lockedUntil || now > record.lockedUntil)) {
            record.count = 1;
            record.firstAttemptAt = now;
            delete record.lockedUntil;
        }
        else {
            record.count += 1;
        }
        if (record.count >= 5) {
            record.lockedUntil = now + 60000;
        }
        this.failedAttempts.set(key, record);
    }
    clearFailedAttempts(identifier) {
        this.failedAttempts.delete(identifier.toLowerCase().trim());
    }
    async registerCustomer(dto) {
        const existing = await this.prisma.customer.findFirst({
            where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
        });
        if (existing) {
            throw new common_1.BadRequestException('Customer already exists with this email or phone');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(dto.password, salt);
        const customer = await this.prisma.customer.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                passwordHash,
            },
        });
        const tokens = await this.generateTokens(customer.id, 'CUSTOMER');
        return {
            ...tokens,
            user: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                userType: 'CUSTOMER',
            },
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
        };
    }
    async loginCustomer(dto) {
        const rawIdentifier = dto.emailOrPhone || dto.email;
        if (!rawIdentifier)
            throw new common_1.UnauthorizedException('Identifier is required');
        const identifier = rawIdentifier.trim();
        this.checkFailedAttempts(identifier);
        const altIdentifier = identifier.includes('@novamobile.test')
            ? identifier.replace('@novamobile.test', '@mobilehubbd.test')
            : identifier.includes('@mobilehubbd.test')
                ? identifier.replace('@mobilehubbd.test', '@novamobile.test')
                : identifier;
        const customer = await this.prisma.customer.findFirst({
            where: {
                OR: [{ email: identifier }, { email: altIdentifier }, { phone: identifier }],
            },
        });
        if (!customer) {
            this.recordFailedAttempt(identifier);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await bcrypt.compare(dto.password, customer.passwordHash);
        if (!isValid) {
            this.recordFailedAttempt(identifier);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.clearFailedAttempts(identifier);
        const tokens = await this.generateTokens(customer.id, 'CUSTOMER');
        return {
            ...tokens,
            user: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                userType: 'CUSTOMER',
            },
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
        };
    }
    async loginStaff(dto) {
        const rawIdentifier = dto.email || dto.emailOrPhone;
        if (!rawIdentifier)
            throw new common_1.UnauthorizedException('Email is required');
        const identifier = rawIdentifier.trim();
        this.checkFailedAttempts(identifier);
        const altIdentifier = identifier.includes('@novamobile.test')
            ? identifier.replace('@novamobile.test', '@mobilehubbd.test')
            : identifier.includes('@mobilehubbd.test')
                ? identifier.replace('@mobilehubbd.test', '@novamobile.test')
                : identifier;
        const staff = await this.prisma.staff.findFirst({
            where: {
                OR: [{ email: identifier }, { email: altIdentifier }, { phone: identifier }],
            },
            include: { role: true },
        });
        if (!staff) {
            this.recordFailedAttempt(identifier);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (staff.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Account is inactive. Contact administrator.');
        }
        const isValid = await bcrypt.compare(dto.password, staff.passwordHash);
        if (!isValid) {
            this.recordFailedAttempt(identifier);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        this.clearFailedAttempts(identifier);
        if (!staff.adminPanelAccess) {
            throw new common_1.ForbiddenException('Your account does not have access to the Admin Panel. Please contact your administrator.');
        }
        const tokens = await this.generateTokens(staff.id, 'STAFF', staff.roleId, staff.role?.name, staff.branchId);
        return {
            ...tokens,
            user: {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
                userType: 'STAFF',
                role: staff.role,
                branchId: staff.branchId,
            },
        };
    }
    async refreshTokens(refreshToken) {
        let decoded;
        try {
            decoded = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
            });
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
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
        let matchedToken = null;
        for (const t of allTokensForUser) {
            if (await bcrypt.compare(refreshToken, t.tokenHash)) {
                matchedToken = t;
                break;
            }
        }
        if (!matchedToken || matchedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.update({
            where: { id: matchedToken.id },
            data: { revoked: true },
        });
        return this.generateTokens(decoded.sub, decoded.userType, decoded.roleId, decoded.roleName, decoded.branchId);
    }
    async logout(refreshToken, userId) {
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
    async changePassword(userId, userType, dto) {
        if (userType === 'STAFF') {
            const user = await this.prisma.staff.findUnique({ where: { id: userId } });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
            if (!isValid)
                throw new common_1.BadRequestException('Incorrect current password');
            const passwordHash = await bcrypt.hash(dto.newPassword, 10);
            await this.prisma.staff.update({
                where: { id: userId },
                data: { passwordHash },
            });
        }
        else {
            const user = await this.prisma.customer.findUnique({ where: { id: userId } });
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
            if (!isValid)
                throw new common_1.BadRequestException('Incorrect current password');
            const passwordHash = await bcrypt.hash(dto.newPassword, 10);
            await this.prisma.customer.update({
                where: { id: userId },
                data: { passwordHash },
            });
        }
        return { success: true };
    }
    async forgotPassword(dto) {
        let userId;
        let userType;
        const staff = await this.prisma.staff.findUnique({ where: { email: dto.email } });
        if (staff) {
            userId = staff.id;
            userType = 'STAFF';
        }
        else {
            const customer = await this.prisma.customer.findUnique({ where: { email: dto.email } });
            if (customer) {
                userId = customer.id;
                userType = 'CUSTOMER';
            }
            else {
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
    async resetPassword(dto) {
        const parts = dto.token.split('.');
        if (parts.length !== 2) {
            throw new common_1.BadRequestException('Invalid token format');
        }
        const [tokenId, rawToken] = parts;
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { id: tokenId },
        });
        if (!record || record.used || record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const isValid = await bcrypt.compare(rawToken, record.tokenHash);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        if (record.userType === 'STAFF') {
            await this.prisma.staff.update({
                where: { id: record.userId },
                data: { passwordHash },
            });
        }
        else {
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
    async getMe(userId, userType) {
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
            if (staff) {
                delete staff.passwordHash;
                return { ...staff, userType: 'STAFF' };
            }
            return null;
        }
        else {
            const customer = await this.prisma.customer.findUnique({
                where: { id: userId },
            });
            if (customer) {
                delete customer.passwordHash;
                return { ...customer, userType: 'CUSTOMER' };
            }
            return null;
        }
    }
    async generateTokens(userId, userType, roleId, roleName, branchId) {
        const payload = { sub: userId, userType, roleId, roleName, branchId };
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map