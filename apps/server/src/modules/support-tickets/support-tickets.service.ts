import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../../common/security/encryption.service';
import { User } from '../users/entities/user.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SupportTicket } from './entities/support-ticket.entity';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket) private readonly ticketsRepository: Repository<SupportTicket>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(userId: string, dto: CreateSupportTicketDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const ticket = await this.ticketsRepository.save(
      this.ticketsRepository.create({
        user,
        subject: this.encryptionService.encrypt(dto.subject.trim()),
        message: this.encryptionService.encrypt(dto.message.trim()),
      }),
    );

    return this.decryptTicket(ticket);
  }

  async findAll() {
    const tickets = await this.ticketsRepository.find({ order: { createdAt: 'DESC' } });
    return tickets.map((ticket) => this.decryptTicket(ticket));
  }

  async findMine(userId: string) {
    const tickets = await this.ticketsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return tickets.map((ticket) => this.decryptTicket(ticket));
  }

  private decryptTicket(ticket: SupportTicket) {
    ticket.subject = this.encryptionService.decrypt(ticket.subject);
    ticket.message = this.encryptionService.decrypt(ticket.message);
    return ticket;
  }
}
