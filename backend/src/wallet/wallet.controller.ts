
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RolesGuard } from '../admin/admin.guard'; // Assuming generic auth guard usage here
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('transfer')
  async transfer(@Body() body: any, @Request() req) {
    // In a real app, req.user.id would be the 'fromUserId'
    return this.walletService.transferFunds({
      fromUserId: req.user.id,
      toUserId: body.toUserId,
      assetId: body.assetId,
      amount: body.amount,
      type: 'TRANSFER',
      referenceId: `txn_${Date.now()}`,
      description: body.description
    });
  }

  @Post('withdraw')
  async withdraw(@Body() body: any, @Request() req) {
    return this.walletService.transferFunds({
      fromUserId: req.user.id,
      assetId: body.assetId,
      amount: body.amount,
      type: 'WITHDRAWAL',
      referenceId: `wd_${Date.now()}`,
      description: 'Bank Withdrawal'
    });
  }
}
