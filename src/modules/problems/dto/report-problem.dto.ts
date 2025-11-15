import { IsString } from 'class-validator';

export class ReportProblemDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  address: string;
}