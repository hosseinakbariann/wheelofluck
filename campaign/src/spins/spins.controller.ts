import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SpinsService } from './spins.service';
import { AuthGuards } from '../auth/auth.guard';

@Controller('spins')
export class SpinsController {
  constructor(private readonly spin: SpinsService) {
  }

  @UseGuards(AuthGuards)
  @Post('')
  turnTheWheel(@Req() req){
    const userId = req.user.id;
    return this.spin.turnTheWheel(userId)
  }

}
