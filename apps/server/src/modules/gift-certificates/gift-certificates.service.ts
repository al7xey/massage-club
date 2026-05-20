import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { CreateGiftCertificateDto } from './dto/create-gift-certificate.dto';
import { UpdateGiftCertificateDto } from './dto/update-gift-certificate.dto';
import { GiftCertificate, GiftCertificateFormat } from './entities/gift-certificate.entity';

@Injectable()
export class GiftCertificatesService {
  constructor(
    @InjectRepository(GiftCertificate) private readonly certificatesRepository: Repository<GiftCertificate>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async create(userId: string, dto: CreateGiftCertificateDto) {
    const buyer = await this.usersRepository.findOneByOrFail({ id: userId });
    const certificate = await this.createWithBuyer(dto, buyer);
    const payment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        user: buyer,
        amountRub: dto.amountRub,
        purpose: `GIFT_CERTIFICATE:${certificate.code}`,
        relatedEntityId: certificate.id,
        provider: 'mock',
        status: PaymentStatus.PAID,
      }),
    );

    return { ...certificate, payment };
  }

  async createAdmin(dto: CreateGiftCertificateDto) {
    return this.createWithBuyer(dto);
  }

  findMine(userId: string) {
    return this.certificatesRepository.find({
      where: { buyer: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(code: string) {
    const certificate = await this.certificatesRepository.findOne({ where: { code } });
    if (!certificate) {
      throw new NotFoundException('Gift certificate not found');
    }
    return certificate;
  }

  findAll() {
    return this.certificatesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: string, dto: UpdateGiftCertificateDto) {
    const certificate = await this.certificatesRepository.findOne({ where: { id } });
    if (!certificate) {
      throw new NotFoundException('Gift certificate not found');
    }
    Object.assign(certificate, dto);
    return this.certificatesRepository.save(certificate);
  }

  async remove(id: string) {
    const certificate = await this.certificatesRepository.findOne({ where: { id } });
    if (!certificate) {
      throw new NotFoundException('Gift certificate not found');
    }
    await this.certificatesRepository.delete(id);
    return { deleted: true };
  }

  private createWithBuyer(dto: CreateGiftCertificateDto, buyer?: User) {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return this.certificatesRepository.save(
      this.certificatesRepository.create({
        buyer,
        recipientName: dto.recipientName,
        recipientContact: dto.recipientContact,
        format: dto.format ?? GiftCertificateFormat.EMAIL,
        message: dto.message,
        amountRub: dto.amountRub,
        code: this.generateCode(),
        expiresAt,
      }),
    );
  }

  private generateCode() {
    return `GIFT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
