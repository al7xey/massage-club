import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { GiftCertificateStatus } from '../entities/gift-certificate.entity';
import { CreateGiftCertificateDto } from './create-gift-certificate.dto';

export class UpdateGiftCertificateDto extends PartialType(CreateGiftCertificateDto) {
  @IsOptional()
  @IsEnum(GiftCertificateStatus)
  status?: GiftCertificateStatus;
}
