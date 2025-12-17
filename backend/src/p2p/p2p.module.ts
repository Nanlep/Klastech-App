
import { Module } from '@nestjs/common';
import { P2PService } from './p2p.service';
import { P2PController } from './p2p.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [P2PController],
  providers: [P2PService, PrismaService],
})
export class P2PModule {}
