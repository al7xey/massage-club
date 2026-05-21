import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicUserDto } from '@massage/shared';
import { Repository } from 'typeorm';
import { normalizeEmail, normalizePhone } from '../../common/utils/normalize-contact.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async findAll() {
    const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });

    return users.map((user) => ({
      ...this.toPublicUser(user),
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));
  }

  async getMe(userId: string): Promise<PublicUserDto> {
    const user = await this.findById(userId);
    return this.toPublicUser(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<PublicUserDto> {
    const user = await this.findById(userId);
    const nextEmail = dto.email !== undefined ? normalizeEmail(dto.email) : user.email ?? null;
    const nextPhone = dto.phone !== undefined ? normalizePhone(dto.phone) : user.phone ?? null;
    const nextFullName = dto.fullName !== undefined ? dto.fullName.trim() : user.fullName;
    const nextAvatarUrl = dto.avatarUrl !== undefined ? dto.avatarUrl.trim() || null : user.avatarUrl ?? null;

    if (!nextFullName) {
      throw new BadRequestException('Full name is required');
    }

    if (!nextEmail && !nextPhone) {
      throw new BadRequestException('Email or phone is required');
    }

    await this.ensureUniqueContacts(nextEmail, nextPhone, user.id);

    user.fullName = nextFullName;
    user.email = nextEmail;
    user.phone = nextPhone;
    user.avatarUrl = nextAvatarUrl;

    return this.toPublicUser(await this.usersRepository.save(user));
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  toPublicUser(user: User): PublicUserDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email ?? null,
      phone: user.phone ?? null,
      avatarUrl: user.avatarUrl ?? null,
      role: user.role,
      gender: user.gender,
    };
  }

  private async ensureUniqueContacts(email: null | string, phone: null | string, currentUserId: string) {
    if (email) {
      const existingByEmail = await this.usersRepository.findOne({ where: { email } });
      if (existingByEmail && existingByEmail.id !== currentUserId) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (phone) {
      const existingByPhone = await this.usersRepository.findOne({ where: { phone } });
      if (existingByPhone && existingByPhone.id !== currentUserId) {
        throw new ConflictException('User with this phone already exists');
      }
    }
  }
}
