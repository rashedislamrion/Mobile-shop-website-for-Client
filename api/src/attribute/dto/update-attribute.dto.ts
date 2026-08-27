import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateAttributeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];
}
