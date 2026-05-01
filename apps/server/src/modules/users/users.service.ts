import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicUserDto } from '@massage/shared';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async findAll() {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getMe(userId: string): Promise<PublicUserDto> {
    const user = await this.findById(userId);
    return this.toPublicUser(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<PublicUserDto> {
    const user = await this.findById(userId);
    Object.assign(user, dto);
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
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? null,
      role: user.role,
    };
  }
}
