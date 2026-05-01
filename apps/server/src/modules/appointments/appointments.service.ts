import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { Master } from '../masters/entities/master.entity';
import { Service } from '../services/entities/service.entity';
import { Studio } from '../studios/entities/studio.entity';
import { User } from '../users/entities/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Service) private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Studio) private readonly studiosRepository: Repository<Studio>,
    @InjectRepository(Master) private readonly mastersRepository: Repository<Master>,
  ) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    const [user, service, studio, master] = await Promise.all([
      this.usersRepository.findOneByOrFail({ id: userId }),
      this.servicesRepository.findOneByOrFail({ id: dto.serviceId }),
      this.studiosRepository.findOneByOrFail({ id: dto.studioId }),
      this.mastersRepository.findOneByOrFail({ id: dto.masterId }),
    ]);

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    const conflict = await this.appointmentsRepository.findOne({
      where: {
        master: { id: master.id },
        status: In([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        startsAt: LessThan(endsAt),
        endsAt: MoreThan(startsAt),
      },
    });

    if (conflict) {
      throw new ConflictException('Master already has an appointment in this time slot');
    }

    return this.appointmentsRepository.save(
      this.appointmentsRepository.create({
        user,
        service,
        studio,
        master,
        startsAt,
        endsAt,
        priceRub: service.priceRub,
        note: dto.note,
      }),
    );
  }

  findMine(userId: string) {
    return this.appointmentsRepository.find({
      where: { user: { id: userId } },
      order: { startsAt: 'DESC' },
    });
  }

  findAll() {
    return this.appointmentsRepository.find({ order: { startsAt: 'DESC' } });
  }

  async cancel(userId: string, id: string) {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.user.id !== userId) {
      throw new ForbiddenException('Appointment belongs to another user');
    }
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentsRepository.save(appointment);
  }
}
