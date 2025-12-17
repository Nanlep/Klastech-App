import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  /**
   * THE ATOMIC TRANSFER ENGINE
   * Handles Double-Entry bookkeeping. 
   * Wraps everything in a transaction.
   */
  async transferFunds(params: {
    fromUserId?: string; // If undefined, it's a System Deposit (Minting)
    toUserId?: string;   // If undefined, it's a System Withdrawal (Burning)
    assetId: string;
    amount: Decimal;
    type: TransactionType;
    referenceId: string;
    description: string;
  }) {
    const { fromUserId, toUserId, assetId, amount, type, referenceId, description } = params;

    return await this.prisma.$transaction(async (tx) => {
      // 1. DEBIT LEG (Sender)
      if (fromUserId) {
        const senderWallet = await tx.wallet.findUnique({
          where: { userId_assetId: { userId: fromUserId, assetId } }
        });

        if (!senderWallet || senderWallet.balance.lessThan(amount)) {
          throw new BadRequestException('Insufficient funds');
        }

        const newBalance = senderWallet.balance.minus(amount);

        // Update Wallet
        await tx.wallet.update({
          where: { id: senderWallet.id },
          data: { balance: newBalance }
        });

        // Write Ledger Entry
        await tx.ledgerEntry.create({
          data: {
            transactionId: referenceId,
            walletId: senderWallet.id,
            assetId,
            amount: amount.negated(), // Debit is negative
            type,
            description: `Debit: ${description}`,
            balanceAfter: newBalance,
            referenceId
          }
        });
      }

      // 2. CREDIT LEG (Receiver)
      if (toUserId) {
        // Find or Create Wallet
        let receiverWallet = await tx.wallet.findUnique({
          where: { userId_assetId: { userId: toUserId, assetId } }
        });

        if (!receiverWallet) {
          receiverWallet = await tx.wallet.create({
            data: { userId: toUserId, assetId, balance: 0 }
          });
        }

        const newBalance = receiverWallet.balance.plus(amount);

        // Update Wallet
        await tx.wallet.update({
          where: { id: receiverWallet.id },
          data: { balance: newBalance }
        });

        // Write Ledger Entry
        await tx.ledgerEntry.create({
          data: {
            transactionId: referenceId,
            walletId: receiverWallet.id,
            assetId,
            amount: amount, // Credit is positive
            type,
            description: `Credit: ${description}`,
            balanceAfter: newBalance,
            referenceId
          }
        });
      }
    });
  }

  /**
   * Locks funds for P2P or Limit Orders
   * Moves funds from 'balance' to 'lockedBalance'
   */
  async lockFunds(userId: string, assetId: string, amount: Decimal) {
    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId_assetId: { userId, assetId } }
      });

      if (!wallet || wallet.balance.lessThan(amount)) {
        throw new BadRequestException('Insufficient funds to lock');
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance.minus(amount),
          lockedBalance: wallet.lockedBalance.plus(amount)
        }
      });
    });
  }

  async unlockFunds(userId: string, assetId: string, amount: Decimal) {
     return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId_assetId: { userId, assetId } }
      });

      if (!wallet || wallet.lockedBalance.lessThan(amount)) {
        throw new BadRequestException('Inconsistent locked state');
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance.plus(amount),
          lockedBalance: wallet.lockedBalance.minus(amount)
        }
      });
    });
  }
}
