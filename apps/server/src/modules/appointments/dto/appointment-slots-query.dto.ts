import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AppointmentSlotsQueryDto {
  @ApiProperty()
  @IsUUID()
  masterId: string;

  @ApiProperty({ example: '2026-05-18' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number;
}
