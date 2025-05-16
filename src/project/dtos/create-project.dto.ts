import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Project story' })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
