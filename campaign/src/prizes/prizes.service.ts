import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrizeDTO, UpdatePrizeDTO } from './dro/prizes.dto';

@Injectable()
export class PrizesService {
  constructor(private readonly prisma: PrismaService) {
  }


  async getAllPrizes(){
    const prizes = await this.prisma.prize.findMany();
    if(!prizes.length) throw new NotFoundException('prize Not Found');
    return prizes;
  }

  async addPrize({ key, title,payload, weight,singleClaim}:CreatePrizeDTO){
    const data =  {
      key,
      title,
      payload,
      weight,
      singleClaim
    };
    const prize = await this.prisma.prize.create({data});

    return prize;
  }

  async updatePrize(id:string,data:UpdatePrizeDTO){
    const prize = await this.prisma.prize.findUnique({where:{id}});
    if(!prize) throw new NotFoundException('Prize Not Found');
    const updatedPrize = await this.prisma.prize.update({
      where:{id},
      data
    });
    return updatedPrize;
  }

  async deletePrize(id:string){
    const prize = await this.prisma.prize.findUnique({where:{id}});
    if(!prize) throw new NotFoundException('Prize Not Found');
    await this.prisma.prize.delete({ where:{id} });
    return {
      message:'Prize Deleted Successfully'
    }
  }
}
