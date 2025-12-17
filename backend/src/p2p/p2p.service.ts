import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';

@Injectable()
export class P2PService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService
  ) {}

  async createOrder(buyerId: string, adId: string, fiatAmount: number) {
    const ad = await this.prisma.p2PAd.findUnique({ where: { id: adId }, include: { maker: true } });
    if (!ad || !ad.isActive) throw new BadRequestException('Ad not available');

    const cryptoAmount = new Decimal(fiatAmount).div(ad.price);
    const sellerId = ad.type === 'SELL' ? ad.makerId : buyerId; 
    // Logic: If Ad is "SELL", Maker is Seller. If Ad is "BUY", Maker is Buyer.

    // If User is selling to a BUY Ad, user is seller.
    const actualSellerId = ad.type === 'BUY' ? buyerId : ad.makerId;
    const actualBuyerId = ad.type === 'BUY' ? ad.makerId : buyerId;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Order Record
      const order = await tx.p2POrder.create({
        data: {
          adId,
          buyerId: actualBuyerId,
          sellerId: actualSellerId,
          fiatAmount: new Decimal(fiatAmount),
          cryptoAmount: cryptoAmount,
          status: 'CREATED'
        }
      });

      // 2. LOCK ASSETS IN ESCROW (From Seller)
      // Note: We call lockFunds. In a real tx context, we'd need to propagate the tx context to walletService
      // For simplicity here, we assume walletService handles concurrency or we refactor to raw prisma calls.
      // Ideally, walletService.lockFunds should accept a Prisma.TransactionClient
      
      // Simulating the lock manually here for the transaction context
      const sellerWallet = await tx.wallet.findUniqueOrThrow({
        where: { userId_assetId: { userId: actualSellerId, assetId: ad.assetId } }
      });

      if (sellerWallet.balance.lessThan(cryptoAmount)) throw new BadRequestException('Seller has insufficient funds');

      await tx.wallet.update({
        where: { id: sellerWallet.id },
        data: {
          balance: sellerWallet.balance.minus(cryptoAmount),
          lockedBalance: sellerWallet.lockedBalance.plus(cryptoAmount)
        }
      });

      return order;
    });
  }

  async releaseOrder(userId: string, orderId: string, pin: string) {
    // 1. Validate User is Seller & PIN (omitted for brevity)
    
    const order = await this.prisma.p2POrder.findUnique({ where: { id: orderId }, include: { ad: true } });
    if (order.status !== 'PAID') throw new BadRequestException('Order not marked as paid');
    if (order.sellerId !== userId) throw new BadRequestException('Unauthorized');

    return await this.prisma.$transaction(async (tx) => {
      // 1. Update Order
      await tx.p2POrder.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }
      });

      // 2. MOVE FUNDS: Locked(Seller) -> Balance(Buyer)
      const sellerWallet = await tx.wallet.findUniqueOrThrow({
         where: { userId_assetId: { userId: order.sellerId, assetId: order.ad.assetId } }
      });
      
      // Burn from Seller Locked
      await tx.wallet.update({
        where: { id: sellerWallet.id },
        data: { lockedBalance: sellerWallet.lockedBalance.minus(order.cryptoAmount) }
      });

      // Mint to Buyer Balance (We use the Ledger here for proper audit)
      // NOTE: Ledger needs to record the movement.
      
      // Helper to update buyer
      let buyerWallet = await tx.wallet.findUnique({
        where: { userId_assetId: { userId: order.buyerId, assetId: order.ad.assetId } }
      });
      if(!buyerWallet) {
         buyerWallet = await tx.wallet.create({ data: { userId: order.buyerId, assetId: order.ad.assetId, balance: 0 }});
      }

      await tx.wallet.update({
         where: { id: buyerWallet.id },
         data: { balance: buyerWallet.balance.plus(order.cryptoAmount) }
      });

      // Create Ledger Entry
      await tx.ledgerEntry.create({
         data: {
            transactionId: order.id,
            walletId: buyerWallet.id,
            assetId: order.ad.assetId,
            amount: order.cryptoAmount,
            type: TransactionType.P2P_RELEASE,
            description: `P2P Release from ${order.sellerId}`,
            balanceAfter: buyerWallet.balance.plus(order.cryptoAmount)
         }
      });
      
      return { success: true };
    });
  }
}
