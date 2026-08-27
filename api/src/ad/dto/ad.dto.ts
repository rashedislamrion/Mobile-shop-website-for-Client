import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AdPlacement, PromoAdStatus } from '@prisma/client';

export class CreateAdDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AdPlacement)
  placement: AdPlacement;

  @IsString()
  @IsNotEmpty()
  linkUrl: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(PromoAdStatus)
  @IsOptional()
  status?: PromoAdStatus = PromoAdStatus.ACTIVE;
}

export class UpdateAdDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AdPlacement)
  @IsOptional()
  placement?: AdPlacement;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(PromoAdStatus)
  @IsOptional()
  status?: PromoAdStatus;
}

export class TrackAdDto {
  @IsIn(['impression', 'click'])
  type: 'impression' | 'click';
}
