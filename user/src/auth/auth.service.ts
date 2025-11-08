import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from "jsonwebtoken";
import { randomUUID } from 'crypto';
import { SignupDto } from './dto/signup.dto';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly secret: string

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.secret = this.configService.get<string>('JWT_SECRET')!;
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: dto.phone },
          { email: dto.email },
        ],
      },
      select: { phone: true, email: true },
    });

    if (existing) {
      if (existing.phone === dto.phone) {
        throw new BadRequestException('Phone number already in use');
      }
      if (existing.email === dto.email) {
        throw new BadRequestException('Email already in use');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const repCode = randomUUID();
    let representative: { id: string } | null = null;

    if (dto.representativeCode) {
      representative = await this.prisma.user.findUnique({
        where: { repCode: dto.representativeCode },
        select: { id: true },
      });

      if (!representative) {
        throw new BadRequestException('Invalid representative code');
      }
    }

    const baseScore = 1; // Everyone gets 1 for signing up
    const newUserScore = representative ? baseScore + 1 : baseScore;

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: passwordHash,
        repCode,
        representativeId: representative?.id ?? null,
        score: newUserScore,
      },
    });

    if (representative?.id) {
      await this.prisma.user.update({
        where: { id: representative.id },
        data: { score: { increment: 1 } },
      });
    }

    return { message: `Welcome ${newUser.name}, you successfully signed up!` };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = await this.generateToken(user);
    return { access_token: token };
  }

  async generateToken(user) {
    return jwt.sign(
      {
        phone: user.phone,
        id: user.id,
      },
      this.secret,
      {
        expiresIn: 86400,
      },
    );
  }

}
