import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SERVICE_URLS } from '../common/http.config';
import { firstValueFrom } from 'rxjs';
import { AuthGuards } from '../auth/auth.guard';

@Controller('purchases')
export class PurchasesGatewayController {
  constructor(private readonly http: HttpService) {}

  private authHeader(req) {
    return { Authorization: req.headers['authorization'] };
  }

  @UseGuards(AuthGuards)
  @Post()
  async create(@Req() req, @Body() body: any) {
    const res = await firstValueFrom(
      this.http.post(`${SERVICE_URLS.SHOPPING}/purchases`, body, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }
}
