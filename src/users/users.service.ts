import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateMeDto } from './dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async findMe(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const { passwordHash, pinHash, ...safe } = user;
    void passwordHash;
    void pinHash;
    return safe;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    Object.assign(user, dto);
    await this.users.save(user);
    return this.findMe(userId);
  }
}
