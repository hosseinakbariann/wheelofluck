import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllGoods() {
    return await this.prisma.good.findMany();
  }

  async createGood(data: { name: string; price: number; description?: string }) {
    return await this.prisma.good.create({ data });
  }

  async updateGood(
    id: string,
    data: { name?: string; price?: number; description?: string },
  ) {
    const existing = await this.prisma.good.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Good not found');

    return this.prisma.good.update({
      where: { id },
      data,
    });
  }

  async deleteGood(id: string) {
    const existing = await this.prisma.good.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Good not found');

    await this.prisma.good.delete({ where: { id } });
    return { message: 'Good deleted successfully' };
  }
}
