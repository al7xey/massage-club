import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditLog } from './entities/audit-log.entity';

interface AuditRecordInput {
  actorId?: string | null;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

@Injectable()
export class AuditLogService {
  constructor(@InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>) {}

  findAll() {
    return this.auditLogRepository.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  async record(input: AuditRecordInput) {
    const entry = this.auditLogRepository.create({
      actorId: input.actorId ?? null,
      actorRole: input.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
    });

    return this.auditLogRepository.save(entry);
  }
}
