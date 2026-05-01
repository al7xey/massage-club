import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { GiftCertificate } from './entities/gift-certificate.entity';
import { GiftCertificatesController } from './gift-certificates.controller';
import { GiftCertificatesService } from './gift-certificates.service';

@Module({
  imports: [TypeOrmModule.forFeature([GiftCertificate, User])],
  controllers: [GiftCertificatesController],
  providers: [GiftCertificatesService],
  exports: [GiftCertificatesService, TypeOrmModule],
})
export class GiftCertificatesModule {}
