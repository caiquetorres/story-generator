import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { MAX_PARTS } from '../constants';

export class SplitDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(MAX_PARTS)
  count: number;
}
