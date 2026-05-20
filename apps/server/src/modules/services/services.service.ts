import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceCatalogQueryDto } from './dto/service-catalog-query.dto';
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

  findCategories() {
    return this.categoriesRepository
      .createQueryBuilder('category')
      .innerJoin('category.services', 'service', 'service.isActive = :isActive', { isActive: true })
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  async findCatalog(query: ServiceCatalogQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(48, Math.max(1, query.limit ?? 12));
    const builder = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.isActive = :isActive', { isActive: true });

    const search = query.search?.trim().toLowerCase();
    if (search) {
      builder.andWhere(
        '(LOWER(service.title) LIKE :search OR LOWER(service.description) LIKE :search OR LOWER(COALESCE(service.composition, \'\')) LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const category = query.category?.trim().toLowerCase();
    if (category) {
      builder.andWhere('(LOWER(category.slug) = :category OR LOWER(category.name) = :category)', { category });
    }

    if (query.duration) {
      builder.andWhere('service.duration_minutes <= :duration', { duration: query.duration });
    }

    if (query.maxPrice !== undefined) {
      builder.andWhere('service.price_rub <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.sort === 'priceAsc') {
      builder.orderBy('service.priceRub', 'ASC').addOrderBy('service.title', 'ASC');
    } else if (query.sort === 'priceDesc') {
      builder.orderBy('service.priceRub', 'DESC').addOrderBy('service.title', 'ASC');
    } else if (query.sort === 'durationAsc') {
      builder.orderBy('service.durationMinutes', 'ASC').addOrderBy('service.title', 'ASC');
    } else if (query.sort === 'durationDesc') {
      builder.orderBy('service.durationMinutes', 'DESC').addOrderBy('service.title', 'ASC');
    } else if (query.sort === 'titleAsc') {
      builder.orderBy('service.title', 'ASC');
    } else {
      builder
        .addSelect(
          `CASE
            WHEN category.slug IN ('massage', 'massage-men') THEN 0
            WHEN category.slug = 'body-correction-wraps' THEN 1
            WHEN category.slug = 'laser-hair-removal' THEN 2
            WHEN category.slug = 'spa-programs' THEN 3
            WHEN category.slug = 'face-care' THEN 4
            ELSE 5
          END`,
          'category_rank',
        )
        .orderBy('category_rank', 'ASC')
        .addOrderBy('service.title', 'ASC');
    }

    const [items, total] = await builder
      .offset((page - 1) * limit)
      .limit(limit)
      .getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
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
      durationLabel: dto.durationLabel,
      composition: dto.composition,
      externalSource: dto.externalSource,
      externalId: dto.externalId,
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
