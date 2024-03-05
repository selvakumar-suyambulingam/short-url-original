import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UrlDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsNotEmpty()
  alias: string;
}
