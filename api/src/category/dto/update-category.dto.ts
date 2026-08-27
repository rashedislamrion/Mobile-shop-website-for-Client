import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StaffStatus } from '@prisma/client';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;
}
