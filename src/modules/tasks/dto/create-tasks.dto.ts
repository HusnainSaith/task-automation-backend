import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  clientId: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}