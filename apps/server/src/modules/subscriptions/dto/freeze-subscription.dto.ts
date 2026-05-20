import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class FreezeSubscriptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  frozenUntil?: string;
}
