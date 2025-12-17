
import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { PrismaService } from '../prisma/prisma.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [TradeController],
  providers: [TradeService, PrismaService],
})
export class TradeModule {}
