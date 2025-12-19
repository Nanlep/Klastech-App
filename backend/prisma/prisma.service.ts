import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Manually defined properties to satisfy TypeScript when generated types are missing
  public user: any;
  public wallet: any;
  public ledgerEntry: any;
  public p2PAd: any;
  public p2POrder: any;
  
  // Manually defined $transaction to satisfy TypeScript
  public $transaction: any;

  async onModuleInit() {
    // Cast to any to access $connect if types are missing
    await (this as any).$connect();
  }

  async onModuleDestroy() {
    // Cast to any to access $disconnect if types are missing
    await (this as any).$disconnect();
  }
}
