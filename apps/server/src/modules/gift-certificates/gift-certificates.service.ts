import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateGiftCertificateDto } from './dto/create-gift-certificate.dto';
import { UpdateGiftCertificateDto } from './dto/update-gift-certificate.dto';
import { GiftCertificate } from './entities/gift-certificate.entity';

@Injectable()
export class GiftCertificatesService {
  constructor(
    @InjectRepository(GiftCertificate) private readonly certificatesRepository: Repository<GiftCertificate>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateGiftCertificateDto) {
    const buyer = await this.usersRepository.findOneByOrFail({ id: userId });
    return this.createWithBuyer(dto, buyer);
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
