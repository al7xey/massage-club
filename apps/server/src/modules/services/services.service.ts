import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceCategory } from './entities/service-category.entity';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private readonly servicesRepository: Repository<Service>,
    @InjectRepository(ServiceCategory) private readonly categoriesRepository: Repository<ServiceCategory>,
  ) {}

  findAll() {
    return this.servicesRepository.find({ where: { isActive: true }, order: { title: 'ASC' } });
  }

  async findOne(id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async create(dto: CreateServiceDto) {
    const service = this.servicesRepository.create({
      title: dto.title,
      slug: dto.slug,
      description: dto.description,
      durationMinutes: dto.durationMinutes,
      priceRub: dto.priceRub,
    });
    if (dto.categoryId) {
      service.category = await this.categoriesRepository.findOneByOrFail({ id: dto.categoryId });
    }
    return this.servicesRepository.save(service);
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    if (dto.categoryId) {
      service.category = await this.categoriesRepository.findOneByOrFail({ id: dto.categoryId });
    }
    return this.servicesRepository.save(service);
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    service.isActive = false;
    return this.servicesRepository.save(service);
  }
}
