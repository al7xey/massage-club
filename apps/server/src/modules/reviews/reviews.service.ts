import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Service) private readonly servicesRepository: Repository<Service>,
  ) {}

  findPublished() {
    return this.reviewsRepository.find({ where: { isPublished: true }, order: { createdAt: 'DESC' } });
  }

  async create(userId: string, dto: CreateReviewDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const service = dto.serviceId ? await this.servicesRepository.findOneByOrFail({ id: dto.serviceId }) : undefined;

    return this.reviewsRepository.save(
      this.reviewsRepository.create({
        user,
        service,
        rating: dto.rating,
        comment: dto.comment?.trim() || undefined,
        isPublished: false,
      }),
    );
  }
}
