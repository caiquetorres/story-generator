import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AssignImageDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;
}
