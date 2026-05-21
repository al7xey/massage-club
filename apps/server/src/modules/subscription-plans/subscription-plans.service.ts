import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGender } from '@massage/shared';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan) private readonly plansRepository: Repository<SubscriptionPlan>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(userId?: string) {
    const plans = await this.plansRepository.find({ where: { isActive: true }, order: { monthlyPriceRub: 'ASC' } });

    if (!userId) {
      return plans;
    }

    const user = await this.usersRepository.findOne({ where: { id: userId, isActive: true } });
    if (!user) {
      return plans;
    }

    return plans.filter((plan) => this.isPlanAvailableForGender(plan.code, user.gender));
  }

  async findOne(id: string) {
    const plan = await this.plansRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  create(dto: CreateSubscriptionPlanDto) {
    return this.plansRepository.save(this.plansRepository.create(dto));
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto) {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.plansRepository.save(plan);
  }

  async remove(id: string) {
    const plan = await this.findOne(id);
    plan.isActive = false;
    return this.plansRepository.save(plan);
  }

  private isPlanAvailableForGender(planCode: string, gender: UserGender) {
    if (planCode.startsWith('FAMILY')) {
      return true;
    }

    if (gender === UserGender.MALE) {
      return planCode.startsWith('MISTER');
    }

    return planCode.startsWith('LADY');
  }
}
