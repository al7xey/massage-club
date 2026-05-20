import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export interface MembershipEntryFeeSettingDto {
  entryFeeRub: number;
  entryFeeEnabled: boolean;
}

export class UpdateMembershipEntryFeeDto {
  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  entryFeeRub?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  entryFeeEnabled?: boolean;
}
