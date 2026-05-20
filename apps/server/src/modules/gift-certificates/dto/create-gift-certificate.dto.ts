import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { GiftCertificateFormat } from '../entities/gift-certificate.entity';

export class CreateGiftCertificateDto {
  @ApiProperty()
  @IsString()
  recipientName: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1000)
  amountRub: number;

  @ApiProperty({ example: 'friend@example.com' })
  @IsString()
  recipientContact: string;

  @ApiProperty({ enum: GiftCertificateFormat, default: GiftCertificateFormat.EMAIL })
  @IsOptional()
  @IsEnum(GiftCertificateFormat)
  format?: GiftCertificateFormat;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
