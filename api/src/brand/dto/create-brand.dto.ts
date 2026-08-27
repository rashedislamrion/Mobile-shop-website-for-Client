import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StaffStatus } from '@prisma/client';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;
}
