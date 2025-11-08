import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './decorators/user.decorator';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthGuards } from './guard/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(AuthGuards)
  @Get('me')
  getUser(
    @User() user
  ) {
    return this.users.getUser(user);
  }

  @UseGuards(AuthGuards)
  @Get('stats')
  getStats(
    @User() user
  ) {
    return this.users.getStats(user);
  }

  @EventPattern('user.score.added')
  async handleUserScoreAdded(
    @Payload() data: { userId: string; score: number },
    @Ctx() context: RmqContext,
  ) {
    try {
      console.log('✅ processing received:', data);
      await this.users.addScoreFromPurchase(data.userId, data.score);
    } catch (error) {
      console.error('❌ Error processing message:', error);
    }
  }

  @EventPattern('spin.finished')
  async handleSpinFinished(
    @Payload() data: { id: string; userId: string; prizeId: string;  date: string },
    @Ctx() context: RmqContext,
  ) {
    try {
      this.users.addPrizeForUser(data);
    } catch (error) {
      console.error('❌ Error handling spin finished:', error);
    }
  }

  @MessagePattern('user.getScore')
  async handleGetUserScore(@Payload() userId: string) {
    const user = await this.users.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    return { score: user.score };
  }


  @UseGuards(AuthGuards)
  @Get('userPrizes')
  userPrizes(
    @User() user
  ){
    const userId = user.id;
    return this.users.getUserPrizes(userId);
  }
}
