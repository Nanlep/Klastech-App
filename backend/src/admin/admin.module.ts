
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService],
  controllers: [] // Admin controllers would go here
})
export class AdminModule {}
