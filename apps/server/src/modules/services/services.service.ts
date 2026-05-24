import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGender } from '@massage/shared';
import { In, MoreThan, Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
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
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Subscription) private readonly subscriptionsRepository: Repository<Subscription>,
  ) {}

  async findAll() {
    const services = await this.servicesRepository.find({ where: { isActive: true }, order: { title: 'ASC' } });
    return services.map(fillSubscriptionPrices);
  }

  async findCategories(userId?: string) {
    const visibility = await this.resolveVisibility(userId);
    const builder = this.categoriesRepository
      .createQueryBuilder('category')
      .innerJoin('category.services', 'service', 'service.isActive = :isActive', { isActive: true });

    if (!visibility.showWomenMassage) {
      builder.andWhere('category.slug != :womenMassageSlug', { womenMassageSlug: 'massage' });
    }

    return builder.orderBy('category.name', 'ASC').getMany();
  }

  async findCatalog(query: ServiceCatalogQueryDto, userId?: string) {
    const visibility = await this.resolveVisibility(userId);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(48, Math.max(1, query.limit ?? 12));
    const builder = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .where('service.isActive = :isActive', { isActive: true });

    if (!visibility.showWomenMassage) {
      builder.andWhere('(category.slug IS NULL OR category.slug != :womenMassageSlug)', { womenMassageSlug: 'massage' });
    }

    const search = query.search?.trim().toLowerCase();
    if (search) {
      builder.andWhere(
        '(LOWER(service.title) LIKE :search OR LOWER(service.description) LIKE :search OR LOWER(COALESCE(service.composition, \'\')) LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const categories = parseCategoryFilter(query.categories ?? query.category);
    if (categories.length > 0) {
      builder.andWhere('LOWER(category.slug) IN (:...categories)', { categories });
    }

    const maxDuration = query.maxDuration ?? query.duration;
    if (query.minDuration !== undefined) {
      builder.andWhere('service.duration_minutes >= :minDuration', { minDuration: query.minDuration });
    }

    if (maxDuration) {
      builder.andWhere('service.duration_minutes <= :maxDuration', { maxDuration });
    }

    if (query.minPrice !== undefined) {
      builder.andWhere('service.price_rub >= :minPrice', { minPrice: query.minPrice });
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
      items: items.map(fillSubscriptionPrices),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  }

  async findOne(id: string, userId?: string) {
    const visibility = await this.resolveVisibility(userId);
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (!visibility.showWomenMassage && service.category?.slug === 'massage') {
      throw new NotFoundException('Service not found');
    }

    return fillSubscriptionPrices(service);
  }

  async create(dto: CreateServiceDto) {
    const imageUrl = dto.imageUrl?.trim() || undefined;
    const service = this.servicesRepository.create({
      title: dto.title,
      slug: dto.slug,
      description: dto.description,
      shortDescription: dto.shortDescription,
      durationMinutes: dto.durationMinutes,
      durationLabel: dto.durationLabel,
      composition: dto.composition,
      externalSource: dto.externalSource,
      externalId: dto.externalId,
      priceRub: dto.priceRub,
      subscriptionPriceRub: calculateDiscountedPrice(dto.priceRub, 20),
      imageUrl,
      galleryUrls: normalizeGalleryUrls(dto.galleryUrls, imageUrl),
      contraindications: dto.contraindications,
      benefits: dto.benefits,
      rules: dto.rules,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      isActive: dto.isActive ?? true,
    });
    if (dto.categoryId) {
      service.category = await this.categoriesRepository.findOneByOrFail({ id: dto.categoryId });
    }
    return fillSubscriptionPrices(await this.servicesRepository.save(service));
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.findOne(id);
    const nextDto = { ...dto };
    if (dto.imageUrl !== undefined) {
      nextDto.imageUrl = dto.imageUrl.trim();
    }
    if (dto.galleryUrls !== undefined || dto.imageUrl !== undefined) {
      nextDto.galleryUrls = normalizeGalleryUrls(
        dto.galleryUrls ?? service.galleryUrls,
        nextDto.imageUrl !== undefined ? nextDto.imageUrl : service.imageUrl ?? undefined,
      );
    }
    Object.assign(service, nextDto);
    if (dto.imageUrl !== undefined) {
      service.imageUrl = nextDto.imageUrl || null;
    }
    if (dto.priceRub !== undefined) {
      service.subscriptionPriceRub = calculateDiscountedPrice(dto.priceRub, 20);
    }
    if (dto.categoryId) {
      service.category = await this.categoriesRepository.findOneByOrFail({ id: dto.categoryId });
    }
    return fillSubscriptionPrices(await this.servicesRepository.save(service));
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    service.isActive = false;
    return fillSubscriptionPrices(await this.servicesRepository.save(service));
  }

  async findAdminAll() {
    const services = await this.servicesRepository.find({ where: { isActive: true }, order: { title: 'ASC' } });
    return services.map(fillSubscriptionPrices);
  }

  async findAdminOne(id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return fillSubscriptionPrices(service);
  }

  private async resolveVisibility(userId?: string) {
    if (!userId) {
      return { showWomenMassage: true };
    }

    const user = await this.usersRepository.findOne({ where: { id: userId, isActive: true } });
    if (!user || user.gender !== UserGender.MALE) {
      return { showWomenMassage: true };
    }

    const hasFamilySubscription = await this.hasActiveFamilySubscription(userId);
    return { showWomenMassage: hasFamilySubscription };
  }

  private async hasActiveFamilySubscription(userId: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: {
        user: { id: userId },
        status: In([
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.FROZEN,
          SubscriptionStatus.AUTO_RENEWAL_DISABLED,
          SubscriptionStatus.PAYMENT_ISSUE,
        ]),
        endsAt: MoreThan(new Date()),
        plan: { code: In(['FAMILY', 'FAMILY_SUPER']) },
      },
    });

    return Boolean(subscription);
  }
}

function parseCategoryFilter(value?: string) {
  return (value ?? '')
    .split(',')
    .map((category) => category.trim().toLowerCase())
    .filter(Boolean);
}

function calculateDiscountedPrice(priceRub: number, discountPercent: number) {
  const normalizedDiscount = Math.min(100, Math.max(0, Math.round(discountPercent)));
  return Math.round(Math.max(0, priceRub) * (1 - normalizedDiscount / 100));
}

function normalizeGalleryUrls(galleryUrls?: string[], imageUrl?: string | null) {
  const urls = Array.from(
    new Set(
      (galleryUrls ?? [])
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  );
  const primary = imageUrl?.trim();
  if (primary) {
    return [primary, ...urls.filter((url) => url !== primary)];
  }
  return urls;
}

function fillSubscriptionPrices<T extends Service>(service: T): T {
  service.subscriptionPriceRub = calculateDiscountedPrice(service.priceRub, 20);
  service.superSubscriptionPriceRub = calculateDiscountedPrice(service.priceRub, 30);
  return service;
}
