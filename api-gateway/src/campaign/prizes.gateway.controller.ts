import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SERVICE_URLS } from '../common/http.config';
import { firstValueFrom } from 'rxjs';
import { AuthGuards } from '../auth/auth.guard';

@Controller('prizes')
export class PrizesGatewayController {
  constructor(private readonly http: HttpService) {}

  private authHeader(req) {
    return { Authorization: req.headers['authorization'] };
  }

  @Get()
  async getAll() {
    const res = await firstValueFrom(
      this.http.get(`${SERVICE_URLS.CAMPAIGN}/prizes`),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Post()
  async addPrize(@Req() req, @Body() body: any) {
    const res = await firstValueFrom(
      this.http.post(`${SERVICE_URLS.CAMPAIGN}/prizes`, body, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Put(':id')
  async updatePrize(@Req() req, @Param('id') id: string, @Body() body: any) {
    const res = await firstValueFrom(
      this.http.put(`${SERVICE_URLS.CAMPAIGN}/prizes/${id}`, body, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Delete(':id')
  async deletePrize(@Req() req, @Param('id') id: string) {
    const res = await firstValueFrom(
      this.http.delete(`${SERVICE_URLS.CAMPAIGN}/prizes/${id}`, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }
}
