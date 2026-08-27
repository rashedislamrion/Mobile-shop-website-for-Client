import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StaffStatus } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
