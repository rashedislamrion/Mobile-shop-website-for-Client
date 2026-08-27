import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurposeCategory, StaffStatus, WalletKind, WalletTxnType } from '@prisma/client';

export class CreateWalletTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(WalletKind)
  @IsNotEmpty()
  kind: WalletKind;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  initialBalance?: number = 0;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus = StaffStatus.ACTIVE;
}

export class UpdateWalletTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(WalletKind)
  @IsOptional()
  kind?: WalletKind;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;
}

export class CreatePurposeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PurposeCategory)
  @IsNotEmpty()
  category: PurposeCategory;
}

export class UpdatePurposeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(PurposeCategory)
  @IsOptional()
  category?: PurposeCategory;
}

export class CreateWalletTransactionDto {
  @IsString()
  @IsNotEmpty()
  walletTypeId: string;

  @IsEnum(WalletTxnType)
  @IsNotEmpty()
  type: WalletTxnType;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  purposeId?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
