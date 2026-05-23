import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { MasterDateAvailabilityStatus } from '../entities/master-date-availability.entity';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateMasterDateAvailabilityDto {
  @IsDateString()
  date: string;

  @IsEnum(MasterDateAvailabilityStatus)
  status: MasterDateAvailabilityStatus;

  @IsOptional()
  @IsUUID()
  studioId?: string;

  @IsOptional()
  @Matches(timePattern)
  startTime?: string;

  @IsOptional()
  @Matches(timePattern)
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateMasterDateAvailabilityDto extends PartialType(CreateMasterDateAvailabilityDto) {}
