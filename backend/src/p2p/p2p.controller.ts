
import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { P2PService } from './p2p.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('P2P Trading')
@ApiBearerAuth()
@Controller('p2p')
export class P2PController {
  constructor(private p2pService: P2PService) {}

  @Post('orders')
  async createOrder(@Body() body: any, @Request() req) {
    return this.p2pService.createOrder(req.user.id, body.adId, body.fiatAmount);
  }

  @Post('orders/:id/release')
  async releaseCrypto(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.p2pService.releaseOrder(req.user.id, id, body.pin);
  }
}
