import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserParams{
  name:string;
  id: string;
  iat:string;
  exp:string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {
  }

  async getUser(user: UserParams) {
    const info = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, phone: true, email: true, score: true, repCode: true },
    });
    if (!info) throw new NotFoundException('User not found');
    return info;
  }

  async getStats(user: UserParams) {
    const info = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        score: true,
        repCode: true,
        representative: { select: { name: true, phone: true } },
        referrals: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!info) throw new NotFoundException('User not found');
    return info;
  }

  async addScoreFromPurchase(userId: string, score:number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { score: { increment: score } },
    });

    console.log(`✅ Score updated for user ${userId}: +${score}`);
  }

  async addPrizeForUser(data: { id: string; userId: string; prizeId: string; date: string; }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.userPrize.create({
      data: {
        spinId:data.id,
        userId: data.userId,
        prizeId: data.prizeId,
        wonAt: new Date(data.date),
      },
    });

    // 🔻 Decrease user’s score by 1
    await this.prisma.user.update({
      where: { id: data.userId },
      data: { score: { decrement: 1 } },
    });

    console.log(`🏆 Prize recorded for user ${data.userId}`);
  }

  async getUserById(userId: string) {
    const userScores = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, score: true },
    });

    return userScores;
  }



  async getUserPrizes(userId: string) {
    const prizes = await this.prisma.userPrize.findMany({
      where: { userId },
      orderBy: { wonAt: 'desc' },
    });

    return prizes.map((p) => ({
      id: p.id,
      prizeId: p.prizeId,
      spinId: p.spinId,
      wonAt: p.wonAt,
    }));
  }
}
