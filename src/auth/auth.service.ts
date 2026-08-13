import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ProtectionService } from '../protection/protection.service';
import { LoginDto, RefreshDto, RegisterDto, SetPinDto, ToggleBiometricDto } from './dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly protection: ProtectionService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save(
      this.users.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
      }),
    );
    await this.protection.ensureForUser(user.id);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  async refresh(dto: RefreshDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.issueTokens(user);
  }

  async setPin(userId: string, dto: SetPinDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    user.pinHash = await bcrypt.hash(dto.pin, 10);
    await this.users.save(user);
    return { message: 'PIN set successfully' };
  }

  async toggleBiometric(userId: string, dto: ToggleBiometricDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (dto.enabled) {
      if (!user.pinHash) {
        if (!dto.pin) {
          throw new BadRequestException('PIN is required to enable biometric unlock');
        }
        user.pinHash = await bcrypt.hash(dto.pin, 10);
      } else if (dto.pin) {
        if (!(await bcrypt.compare(dto.pin, user.pinHash))) {
          throw new UnauthorizedException('Incorrect PIN');
        }
      }
    }

    user.biometricEnabled = dto.enabled;
    await this.users.save(user);
    return { biometricEnabled: user.biometricEnabled };
  }

  private async issueTokens(user: User) {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };
    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m',
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '30d',
      }),
    ]);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        biometricEnabled: user.biometricEnabled,
      },
    };
  }
}
