
import { Controller, Post, Body, Request } from '@nestjs/common';
import { TradeService } from './trade.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Trading')
@ApiBearerAuth()
@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @Post('market')
  async marketOrder(@Body() body: any, @Request() req) {
    return this.tradeService.executeMarketOrder(req.user.id, body.fromAsset, body.toAsset, body.amount);
  }
}
