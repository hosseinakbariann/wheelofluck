import { Controller, Get, Post, Body, UseGuards, Put, Delete, Param} from '@nestjs/common';
import { GoodsService } from './goods.service';
import { AuthGuards } from '../auth/auth.guard';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Get()
  async getAll() {
    return this.goodsService.getAllGoods();
  }

  @UseGuards(AuthGuards)
  @Post()
  async create(@Body() body: { name: string; price: number; description?: string }) {
    return this.goodsService.createGood(body);
  }

  @UseGuards(AuthGuards)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; price?: number; description?: string },
  ) {
    return this.goodsService.updateGood(id, body);
  }

  @UseGuards(AuthGuards)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.goodsService.deleteGood(id);
  }
}
