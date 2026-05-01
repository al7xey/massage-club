import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class MockCheckoutDto {
  @ApiProperty({ example: 9900 })
  @IsNumber()
  @Min(1)
  amountRub: number;

  @ApiProperty({ example: 'subscription' })
  @IsString()
  purpose: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedEntityId?: string;
}
