import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SupportTicket } from './entities/support-ticket.entity';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket) private readonly ticketsRepository: Repository<SupportTicket>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateSupportTicketDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    return this.ticketsRepository.save(this.ticketsRepository.create({ user, ...dto }));
  }

  findAll() {
    return this.ticketsRepository.find({ order: { createdAt: 'DESC' } });
  }

  findMine(userId: string) {
    return this.ticketsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
