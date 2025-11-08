import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SERVICE_URLS } from '../common/http.config';
import { firstValueFrom } from 'rxjs';
import { AuthGuards } from '../auth/auth.guard';

@Controller('goods')
export class GoodsGatewayController {
  constructor(private readonly http: HttpService) {}

  private authHeader(req) {
    return { Authorization: req.headers['authorization'] };
  }

  @Get()
  async getAll() {
    const res = await firstValueFrom(
      this.http.get(`${SERVICE_URLS.SHOPPING}/goods`),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Post()
  async create(@Req() req, @Body() body: any) {
    const res = await firstValueFrom(
      this.http.post(`${SERVICE_URLS.SHOPPING}/goods`, body, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() body: any) {
    const res = await firstValueFrom(
      this.http.put(`${SERVICE_URLS.SHOPPING}/goods/${id}`, body, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    const res = await firstValueFrom(
      this.http.delete(`${SERVICE_URLS.SHOPPING}/goods/${id}`, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }
}
