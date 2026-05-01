import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateGiftCertificateDto {
  @ApiProperty()
  @IsString()
  recipientName: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(500)
  amountRub: number;
}
