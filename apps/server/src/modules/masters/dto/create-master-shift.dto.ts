import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateMasterShiftDto {
  @ApiProperty()
  @IsUUID()
  masterId: string;

  @ApiProperty()
  @IsUUID()
  studioId: string;

  @ApiProperty()
  @IsDateString()
  startsAt: string;

  @ApiProperty()
  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
