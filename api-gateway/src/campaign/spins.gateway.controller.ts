import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SERVICE_URLS } from '../common/http.config';
import { firstValueFrom } from 'rxjs';
import { AuthGuards } from '../auth/auth.guard';

@Controller('spin')
export class SpinsGatewayController {
  constructor(private readonly http: HttpService) {}

  private authHeader(req) {
    return { Authorization: req.headers['authorization'] };
  }

  @UseGuards(AuthGuards)
  @Post()
  async spin(@Req() req) {
    const res = await firstValueFrom(
      this.http.post(`${SERVICE_URLS.CAMPAIGN}/spin`, {}, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }
}
