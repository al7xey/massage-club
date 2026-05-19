import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class AvailableMastersQueryDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsUUID()
  studioId: string;

  @ApiProperty()
  @IsDateString()
  startsAt: string;
}
