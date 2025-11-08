import { Body, Controller, Delete, Get, Post, Put, UseGuards, Param } from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { AuthGuards } from '../auth/auth.guard';
import { CreatePrizeDTO, UpdatePrizeDTO } from './dro/prizes.dto';

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prize:PrizesService) {
  }


  @Get('')
  getAllPrizes(){
    return this.prize.getAllPrizes();
  }

  @UseGuards(AuthGuards)
  @Post('')
  addPrize(
    @Body() body:CreatePrizeDTO,
  ){
    return this.prize.addPrize(body);
  }

  @UseGuards(AuthGuards)
  @Put(':id')
  updatePrize(
    @Param('id') id:string,
    @Body() body:UpdatePrizeDTO
  ){
    return this.prize.updatePrize(id,body);
  }

  @UseGuards(AuthGuards)
  @Delete(':id')
  deletePrize(
    @Param('id') id:string,
  ){
    return this.prize.deletePrize(id);
  }
}
