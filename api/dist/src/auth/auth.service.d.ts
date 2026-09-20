import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    private failedAttempts;
    private checkFailedAttempts;
    private recordFailedAttempt;
    private clearFailedAttempts;
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
            userType: string;
        };
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    loginCustomer(dto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
            userType: string;
        };
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    loginStaff(dto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            userType: string;
            role: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                scope: import(".prisma/client").$Enums.PermissionScope;
                isSystem: boolean;
            };
            branchId: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string, userId: string): Promise<{
        success: boolean;
    }>;
    changePassword(userId: string, userType: 'STAFF' | 'CUSTOMER', dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
        resetToken?: undefined;
    } | {
        success: boolean;
        resetToken: string;
        message?: undefined;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    getMe(userId: string, userType: 'STAFF' | 'CUSTOMER'): Promise<{
        userType: string;
        role: {
            permissions: {
                id: string;
                roleId: string;
                module: import(".prisma/client").$Enums.ModuleName;
                action: import(".prisma/client").$Enums.PermissionAction;
                allowed: boolean;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            scope: import(".prisma/client").$Enums.PermissionScope;
            isSystem: boolean;
        };
        branch: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.StaffStatus;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            type: import(".prisma/client").$Enums.BranchType;
            address: string;
            city: string;
            phone: string;
            altPhone: string | null;
            email: string | null;
            managerId: string | null;
            operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
            openingStockValue: import("@prisma/client/runtime/library").Decimal;
            taxRegNumber: string | null;
            showInFooter: boolean;
            isOnlineDefault: boolean;
        } | null;
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.StaffStatus;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        address: string | null;
        phone: string;
        email: string;
        employeeId: string;
        passwordHash: string;
        photo: string | null;
        gender: string | null;
        dob: Date | null;
        nidNumber: string | null;
        departmentId: string | null;
        branchId: string | null;
        employmentType: import(".prisma/client").$Enums.EmploymentType;
        joiningDate: Date;
        reportingManagerId: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal;
        allowances: import("@prisma/client/runtime/library").JsonValue | null;
        paymentMethod: import(".prisma/client").$Enums.StaffPaymentMethod | null;
        bankAccountNo: string | null;
        birthCertificateUrl: string | null;
        bonusLimit: import("@prisma/client/runtime/library").Decimal;
        adminPanelAccess: boolean;
        isTechnician: boolean;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        profitSharePercentage: import("@prisma/client/runtime/library").Decimal | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        emergencyContactRelationship: string | null;
        sendCredentialsEmailOnCreate: boolean;
    } | {
        userType: string;
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.StaffStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string | null;
        passwordHash: string;
        photo: string | null;
        profileImageUrl: string | null;
        source: string | null;
        walletBalance: import("@prisma/client/runtime/library").Decimal;
        emailVerified: boolean;
        phoneVerified: boolean;
    } | null>;
    private generateTokens;
}
