import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFooterSettingsDto {
  @IsString()
  @IsNotEmpty()
  supportPhone: string;

  @IsEmail()
  @IsNotEmpty()
  supportEmail: string;

  @IsString()
  @IsOptional()
  liveChatLink?: string;

  @IsString()
  @IsOptional()
  faqLink?: string;

  @IsString()
  @IsNotEmpty()
  copyrightText: string;
}
