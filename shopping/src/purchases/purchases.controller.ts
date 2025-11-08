import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { AuthGuards } from '../auth/auth.guard';

@Controller('purchases')
export class PurchaseController {
  constructor(
    private readonly purchase: PurchasesService
  ) {}

  @UseGuards(AuthGuards)
  @Post()
  async create(@Req() req, @Body() body: { goodId: string; amount: number }) {
    const userId = req.user.id;
    return this.purchase.createPurchase(userId, body.goodId, body.amount);
  }
}
