import { IsDateString, IsUUID, IsOptional, IsString } from 'class-validator';

export class UrlUsageDto {
  @IsUUID()
  urlId: string;

  @IsDateString()
  accessTime: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
