import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class UpdateBusinessSettingsDto {
  @IsObject()
  @IsOptional()
  general?: Record<string, any>;

  @IsObject()
  @IsOptional()
  branding?: Record<string, any>;

  @IsObject()
  @IsOptional()
  currencyTax?: Record<string, any>;

  @IsObject()
  @IsOptional()
  orderSettings?: Record<string, any>;

  @IsObject()
  @IsOptional()
  notifications?: Record<string, any>;
}
