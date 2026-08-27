import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType, StaffPaymentMethod, StaffStatus } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string; // If omitted, defaults to temporary password

  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType = EmploymentType.FULL_TIME;

  @IsString()
  @IsOptional()
  joiningDate?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  nidNumber?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  reportingManagerId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  basicSalary?: number = 0;

  @IsOptional()
  allowances?: Record<string, number>;

  @IsEnum(StaffPaymentMethod)
  @IsOptional()
  paymentMethod?: StaffPaymentMethod;

  @IsString()
  @IsOptional()
  bankAccountNo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus = StaffStatus.ACTIVE;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsString()
  @IsOptional()
  joiningDate?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  nidNumber?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  reportingManagerId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  basicSalary?: number;

  @IsOptional()
  allowances?: Record<string, number>;

  @IsEnum(StaffPaymentMethod)
  @IsOptional()
  paymentMethod?: StaffPaymentMethod;

  @IsString()
  @IsOptional()
  bankAccountNo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;
}

export class UpdateStatusDto {
  @IsEnum(StaffStatus)
  @IsNotEmpty()
  status: StaffStatus;
}

export class UpdateSpecializationsDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  specializations: string[];
}
