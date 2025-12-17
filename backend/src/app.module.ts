import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { TradeModule } from './trade/trade.module';
import { P2PModule } from './p2p/p2p.module';
import { AdminModule } from './admin/admin.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    WalletModule,
    TradeModule,
    P2PModule,
    AdminModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
