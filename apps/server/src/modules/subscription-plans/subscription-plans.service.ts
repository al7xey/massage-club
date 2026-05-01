import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
  constructor(@InjectRepository(SubscriptionPlan) private readonly plansRepository: Repository<SubscriptionPlan>) {}

  findAll() {
    return this.plansRepository.find({ where: { isActive: true }, order: { monthlyPriceRub: 'ASC' } });
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
}
