import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsOptional, IsUUID, ValidateNested } from 'class-validator';

export class CheckoutCartItemDto {
  @ApiProperty()
  @IsUUID()
  cartItemId: string;

  @ApiProperty()
  @IsUUID()
  masterId: string;

  @ApiProperty()
  @IsDateString()
  startsAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  useSubscriptionCredit?: boolean;
}

export class CheckoutCartDto {
  @ApiProperty()
  @IsUUID()
  studioId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ type: [CheckoutCartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutCartItemDto)
  items: CheckoutCartItemDto[];
}
