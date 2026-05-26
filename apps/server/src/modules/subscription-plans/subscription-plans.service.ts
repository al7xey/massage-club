import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan) private readonly plansRepository: Repository<SubscriptionPlan>,
  ) {}

  async findAll() {
    const plans = await this.plansRepository.find({ where: { isActive: true } });
    return plans.sort((left, right) => getPlanSortIndex(left.code) - getPlanSortIndex(right.code)).map(withDisplayName);
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

const planTitlesByCode: Record<string, string> = {
  LADY: 'LADY',
  LADY_SUPER: 'LADY SUPER',
  MISTER: 'MISTER',
  MISTER_SUPER: 'MISTER SUPER',
  FAMILY: 'FAMILY',
  FAMILY_SUPER: 'FAMILY SUPER',
};

const planOrder = ['LADY', 'LADY_SUPER', 'MISTER', 'MISTER_SUPER', 'FAMILY', 'FAMILY_SUPER'] as const;

function getPlanSortIndex(code: string) {
  const index = planOrder.indexOf(code as (typeof planOrder)[number]);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function withDisplayName(plan: SubscriptionPlan) {
  const displayName = planTitlesByCode[plan.code];
  return displayName ? Object.assign(plan, { name: displayName }) : plan;
}
