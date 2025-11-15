import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateServicemanDto {
  @IsUUID()
  userId: string;

  @IsString()
  homeBaseAddress: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}