import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import LoginDto from './auth.dto';
import { CreateUserDto } from '../users/users.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (
      !user ||
      (await bcrypt.compare(dto.password, user.password)) === false
    ) {
      throw new UnauthorizedException('Wrong email or password');
    }

    return this.sighToken(user.id, user.email);
  }

  async register(dto: CreateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExists) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
      },
    });

    return this.sighToken(user.id, user.email);
  }

  private async sighToken(sub: string, email: string) {
    return {
      access_token: await this.jwt.signAsync({ sub, email }),
    };
  }
}
