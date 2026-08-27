import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StaffStatus } from '@prisma/client';

export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;
}
