import { PartialType } from '@nestjs/swagger';
import { CreateGiftCertificateDto } from './create-gift-certificate.dto';

export class UpdateGiftCertificateDto extends PartialType(CreateGiftCertificateDto) {}
