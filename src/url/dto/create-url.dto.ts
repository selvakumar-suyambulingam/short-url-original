import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateUrlDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
