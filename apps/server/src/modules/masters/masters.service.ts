import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { Studio } from '../studios/entities/studio.entity';
import { CreateMasterShiftDto } from './dto/create-master-shift.dto';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterShiftDto } from './dto/update-master-shift.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { MasterShift } from './entities/master-shift.entity';
import { Master } from './entities/master.entity';

@Injectable()
export class MastersService {
  constructor(
    @InjectRepository(Master) private readonly mastersRepository: Repository<Master>,
    @InjectRepository(MasterShift) private readonly shiftsRepository: Repository<MasterShift>,
    @InjectRepository(Studio) private readonly studiosRepository: Repository<Studio>,
    @InjectRepository(Service) private readonly servicesRepository: Repository<Service>,
  ) {}

  findAll() {
    return this.mastersRepository.find({ where: { isActive: true }, order: { lastName: 'ASC' } });
  }

  async findOne(id: string) {
    const master = await this.mastersRepository.findOne({ where: { id } });
    if (!master) {
      throw new NotFoundException('Master not found');
    }
    return master;
  }

  async create(dto: CreateMasterDto) {
    const name = normalizeMasterName(dto);
    const master = this.mastersRepository.create({
      firstName: name.firstName,
      lastName: name.lastName,
      bio: dto.description ?? dto.bio,
      phone: dto.phone,
      specialization: dto.specialization,
      experienceYears: dto.experienceYears ?? 0,
      photoUrl: dto.photoUrl,
      isActive: dto.isActive ?? true,
    });
    const studioIds = dto.studioIds ?? (dto.studioId ? [dto.studioId] : []);
    if (studioIds.length) {
      master.studios = await this.studiosRepository.findBy({ id: In(studioIds) });
      master.studio = master.studios[0];
    }
    if (dto.serviceIds?.length) {
      master.services = await this.servicesRepository.findBy({ id: In(dto.serviceIds) });
    }
    return this.mastersRepository.save(master);
  }

  async update(id: string, dto: UpdateMasterDto) {
    const master = await this.findOne(id);
    if (dto.fullName !== undefined || dto.firstName !== undefined || dto.lastName !== undefined) {
      const name = normalizeMasterName(dto, master);
      master.firstName = name.firstName;
      master.lastName = name.lastName;
    }
    if (dto.bio !== undefined || dto.description !== undefined) master.bio = dto.description ?? dto.bio;
    if (dto.phone !== undefined) master.phone = dto.phone;
    if (dto.specialization !== undefined) master.specialization = dto.specialization;
    if (dto.experienceYears !== undefined) master.experienceYears = dto.experienceYears;
    if (dto.photoUrl !== undefined) master.photoUrl = dto.photoUrl;
    if (dto.isActive !== undefined) master.isActive = dto.isActive;
    const studioIds = dto.studioIds ?? (dto.studioId ? [dto.studioId] : undefined);
    if (studioIds) {
      master.studios = await this.studiosRepository.findBy({ id: In(studioIds) });
      master.studio = master.studios[0];
    }
    if (dto.serviceIds) {
      master.services = await this.servicesRepository.findBy({ id: In(dto.serviceIds) });
    }
    return this.mastersRepository.save(master);
  }

  async remove(id: string) {
    const master = await this.findOne(id);
    master.isActive = false;
    return this.mastersRepository.save(master);
  }

  findShifts() {
    return this.shiftsRepository.find({ order: { startsAt: 'ASC' } });
  }

  async createShift(dto: CreateMasterShiftDto) {
    const dates = resolveShiftDates(dto);
    const shift = this.shiftsRepository.create({
      master: await this.mastersRepository.findOneByOrFail({ id: dto.masterId }),
      studio: await this.studiosRepository.findOneByOrFail({ id: dto.studioId }),
      startsAt: dates.startsAt,
      endsAt: dates.endsAt,
      isAvailable: dto.isAvailable ?? true,
    });
    return this.shiftsRepository.save(shift);
  }

  async updateShift(id: string, dto: UpdateMasterShiftDto) {
    const shift = await this.shiftsRepository.findOneByOrFail({ id });
    if (dto.masterId) shift.master = await this.mastersRepository.findOneByOrFail({ id: dto.masterId });
    if (dto.studioId) shift.studio = await this.studiosRepository.findOneByOrFail({ id: dto.studioId });
    if (dto.startsAt) shift.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) shift.endsAt = new Date(dto.endsAt);
    if (dto.isAvailable !== undefined) shift.isAvailable = dto.isAvailable;
    return this.shiftsRepository.save(shift);
  }

  async removeShift(id: string) {
    await this.shiftsRepository.delete(id);
    return { deleted: true };
  }
}

function normalizeMasterName(dto: CreateMasterDto | UpdateMasterDto, fallback?: Master) {
  if (dto.fullName) {
    const parts = dto.fullName.trim().split(/\s+/);
    return { firstName: parts.shift() ?? '', lastName: parts.join(' ') || ' ' };
  }
  return {
    firstName: dto.firstName ?? fallback?.firstName ?? '',
    lastName: dto.lastName ?? fallback?.lastName ?? ' ',
  };
}

function resolveShiftDates(dto: CreateMasterShiftDto) {
  const startsAt = dto.startsAt
    ? new Date(dto.startsAt)
    : dto.date && dto.startTime
      ? new Date(`${dto.date.slice(0, 10)}T${dto.startTime}:00.000+03:00`)
      : null;
  const endsAt = dto.endsAt
    ? new Date(dto.endsAt)
    : dto.date && dto.endTime
      ? new Date(`${dto.date.slice(0, 10)}T${dto.endTime}:00.000+03:00`)
      : null;

  if (!startsAt || !endsAt) {
    throw new NotFoundException('Valid shift date and time are required');
  }

  return { startsAt, endsAt };
}
