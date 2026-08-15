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
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    loginCustomer(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    loginStaff(dto: LoginDto): Promise<{
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string;
        passwordHash: string;
        photo: string | null;
        status: import(".prisma/client").$Enums.StaffStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
    } | ({
        role: {
            permissions: {
                id: string;
                roleId: string;
                module: import(".prisma/client").$Enums.ModuleName;
                action: import(".prisma/client").$Enums.PermissionAction;
                allowed: boolean;
            }[];
        } & {
            name: string;
            id: string;
            description: string | null;
            scope: import(".prisma/client").$Enums.PermissionScope;
            isSystem: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        branch: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string;
            status: import(".prisma/client").$Enums.StaffStatus;
            code: string;
            type: import(".prisma/client").$Enums.BranchType;
            address: string;
            city: string;
            altPhone: string | null;
            managerId: string | null;
            operatingHours: import("@prisma/client/runtime/library").JsonValue | null;
            openingStockValue: import("@prisma/client/runtime/library").Decimal;
            taxRegNumber: string | null;
            showInFooter: boolean;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        roleId: string;
        employeeId: string;
        email: string;
        phone: string;
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
        status: import(".prisma/client").$Enums.StaffStatus;
        basicSalary: import("@prisma/client/runtime/library").Decimal;
        allowances: import("@prisma/client/runtime/library").JsonValue | null;
        paymentMethod: import(".prisma/client").$Enums.StaffPaymentMethod | null;
        bankAccountNo: string | null;
        specializations: string[];
    }) | null>;
    private generateTokens;
}
