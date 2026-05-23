import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteContent, SiteContentType } from './entities/site-content.entity';
import { UpsertSiteContentDto } from './dto/upsert-site-content.dto';

const defaultContent: Array<Pick<SiteContent, 'key' | 'title' | 'type'> & { value: unknown }> = [
  { key: 'home.hero.title', title: 'Главный экран: заголовок', type: SiteContentType.TEXT, value: 'Время для себя каждый месяц' },
  { key: 'home.hero.subtitle', title: 'Главный экран: подзаголовок', type: SiteContentType.TEXT, value: 'Массаж, SPA и уход по единой подписке.' },
  { key: 'home.hero.primaryButton', title: 'Главный экран: основная кнопка', type: SiteContentType.TEXT, value: 'Выбрать тариф' },
  { key: 'home.hero.secondaryButton', title: 'Главный экран: вторичная кнопка', type: SiteContentType.TEXT, value: 'Записаться на услугу' },
  { key: 'site.contacts.phone', title: 'Телефон', type: SiteContentType.TEXT, value: '+7 495 000-00-00' },
  { key: 'site.contacts.email', title: 'Email', type: SiteContentType.TEXT, value: 'hello@massage.local' },
  { key: 'site.footer.text', title: 'Текст футера', type: SiteContentType.TEXT, value: 'RelaxUp. Забота о теле и спокойствии.' },
];

@Injectable()
export class SiteContentService {
  constructor(@InjectRepository(SiteContent) private readonly repository: Repository<SiteContent>) {}

  async findAll() {
    await this.ensureDefaults();
    return this.repository.find({ order: { key: 'ASC' } });
  }

  async findByKey(key: string) {
    await this.ensureDefaults();
    const content = await this.repository.findOne({ where: { key } });
    if (!content) {
      throw new NotFoundException('Site content not found');
    }
    return content;
  }

  async upsert(key: string, dto: UpsertSiteContentDto) {
    const existing = await this.repository.findOne({ where: { key } });
    const content =
      existing ??
      this.repository.create({
        key,
        title: dto.title ?? key,
        type: dto.type ?? SiteContentType.TEXT,
      });

    if (dto.title !== undefined) content.title = dto.title;
    if (dto.type !== undefined) content.type = dto.type;
    if (dto.value !== undefined) content.value = dto.value;
    return this.repository.save(content);
  }

  private async ensureDefaults() {
    for (const item of defaultContent) {
      const existing = await this.repository.findOne({ where: { key: item.key } });
      if (!existing) {
        await this.repository.save(this.repository.create(item));
      }
    }
  }
}
