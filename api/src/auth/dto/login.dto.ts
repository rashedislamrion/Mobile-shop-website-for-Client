import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  emailOrPhone?: string; // used for customer

  @IsString()
  @IsNotEmpty()
  email?: string; // used for staff

  @IsString()
  @IsNotEmpty()
  password: string;
}
