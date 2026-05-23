import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { Studio } from './entities/studio.entity';

@Injectable()
export class StudiosService {
  constructor(@InjectRepository(Studio) private readonly studiosRepository: Repository<Studio>) {}

  findAll() {
    return this.studiosRepository.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const studio = await this.studiosRepository.findOne({ where: { id } });
    if (!studio) {
      throw new NotFoundException('Studio not found');
    }
    return studio;
  }

  create(dto: CreateStudioDto) {
    return this.studiosRepository.save(
      this.studiosRepository.create({
        ...dto,
        photoUrls: normalizePhotoUrls(dto.photoUrls, dto.photoUrl),
      }),
    );
  }

  async update(id: string, dto: UpdateStudioDto) {
    const studio = await this.findOne(id);
    Object.assign(studio, dto);
    if (dto.photoUrls !== undefined || dto.photoUrl !== undefined) {
      studio.photoUrls = normalizePhotoUrls(dto.photoUrls ?? studio.photoUrls, dto.photoUrl ?? studio.photoUrl);
    }
    return this.studiosRepository.save(studio);
  }

  async remove(id: string) {
    const studio = await this.findOne(id);
    studio.isActive = false;
    return this.studiosRepository.save(studio);
  }
}

function normalizePhotoUrls(photoUrls?: string[], photoUrl?: string | null) {
  const urls = (photoUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean);
  const primary = photoUrl?.trim();
  if (primary && !urls.includes(primary)) {
    return [primary, ...urls];
  }
  return urls;
}
