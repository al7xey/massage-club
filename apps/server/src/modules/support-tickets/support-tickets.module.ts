import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { EncryptionService } from '../../common/security/encryption.service';
import { SupportTicket } from './entities/support-ticket.entity';
import { SupportTicketsController } from './support-tickets.controller';
import { SupportTicketsService } from './support-tickets.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportTicket, User])],
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService, EncryptionService],
  exports: [SupportTicketsService, TypeOrmModule],
})
export class SupportTicketsModule {}
