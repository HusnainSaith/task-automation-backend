import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  address: string;
}