import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class FreezeSubscriptionDto {
  @ApiProperty()
  @IsDateString()
  frozenUntil: string;
}
