import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class ServiceSlotsQueryDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsUUID()
  studioId: string;

  @ApiProperty({ example: '2026-05-20' })
  @IsDateString()
  date: string;
}
