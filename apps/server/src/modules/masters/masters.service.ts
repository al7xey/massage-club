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
    const master = this.mastersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      bio: dto.bio,
    });
    if (dto.studioId) {
      master.studio = await this.studiosRepository.findOneByOrFail({ id: dto.studioId });
    }
    if (dto.serviceIds?.length) {
      master.services = await this.servicesRepository.findBy({ id: In(dto.serviceIds) });
    }
    return this.mastersRepository.save(master);
  }

  async update(id: string, dto: UpdateMasterDto) {
    const master = await this.findOne(id);
    Object.assign(master, dto);
    if (dto.studioId) {
      master.studio = await this.studiosRepository.findOneByOrFail({ id: dto.studioId });
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
    const shift = this.shiftsRepository.create({
      master: await this.mastersRepository.findOneByOrFail({ id: dto.masterId }),
      studio: await this.studiosRepository.findOneByOrFail({ id: dto.studioId }),
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
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
