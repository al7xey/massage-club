import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsUUID, Matches, Max, Min, ValidateNested } from 'class-validator';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class WeeklyScheduleIntervalDto {
  @IsUUID()
  studioId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  intervalIndex?: number;

  @IsOptional()
  @IsBoolean()
  isWorking?: boolean;

  @Matches(timePattern)
  startTime: string;

  @Matches(timePattern)
  endTime: string;

  @IsOptional()
  @Matches(timePattern)
  breakStartTime?: string;

  @IsOptional()
  @Matches(timePattern)
  breakEndTime?: string;
}

export class WeeklyScheduleDayDto {
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @IsOptional()
  @IsBoolean()
  isWorking?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyScheduleIntervalDto)
  intervals: WeeklyScheduleIntervalDto[];
}

export class PutWeeklyScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyScheduleDayDto)
  days: WeeklyScheduleDayDto[];
}
