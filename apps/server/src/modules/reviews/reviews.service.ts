import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review) private readonly reviewsRepository: Repository<Review>) {}

  findPublished() {
    return this.reviewsRepository.find({ where: { isPublished: true }, order: { createdAt: 'DESC' } });
  }
}
