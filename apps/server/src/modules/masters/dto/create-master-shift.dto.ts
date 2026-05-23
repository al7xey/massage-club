import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateMasterShiftDto {
  @ApiProperty()
  @IsUUID()
  masterId: string;

  @ApiProperty()
  @IsUUID()
  studioId: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
