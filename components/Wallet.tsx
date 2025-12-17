
import React, { useState } from 'react';
import { Asset, AssetType, Transaction } from '../types';
import { Filter, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Send, QrCode, Lock, Coins, Receipt, EyeOff } from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

interface WalletProps {
  assets: Asset[];
  transactions: Transaction[];
  onDeposit: () => void;
  onSendCrypto: (assetId: string) => void;
  onReceiveCrypto: (assetId: string) => void;
  isPrivacyMode?: boolean; // New Prop
}

export const Wallet: React.FC<WalletProps> = ({ assets, transactions, onDeposit, onSendCrypto, onReceiveCrypto, isPrivacyMode = false }) => {
  const [filter, setFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions
    .filter(t => filter === 'ALL' || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Masking Helper
  const dVal = (val: string) => isPrivacyMode ? '****' : val;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
      
      <ReceiptModal 
        isOpen={!!selectedTx} 
        transaction={selectedTx} 
        onClose={() => setSelectedTx(null)} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             Wallet & Activity {isPrivacyMode && <EyeOff size={18} className="text-indigo-400" />}
          </h2>
          <p className="text-slate-400 text-sm">Manage assets and view transaction history</p>
        </div>
        <button 
          onClick={onDeposit}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <ArrowDownLeft size={20} />
          Deposit NGN
        </button>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <img src={asset.iconUrl} alt={asset.name} className="w-10 h-10 rounded-full bg-slate-700" />
                  <div>
                    <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{asset.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{asset.symbol}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${asset.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                </div>
              </div>
              
              <div className="space-y-3 relative z-10 mb-6">
                <div>
                   <p className="text-xs text-slate-500 uppercase font-bold">Total Balance</p>
                   <p className="text-2xl font-bold text-white tracking-tight">
                     {dVal((asset.balance + (asset.stakedBalance || 0)).toLocaleString(undefined, { maximumFractionDigits: 6 }))}
                   </p>
                   <p className="text-sm text-slate-500">
                     ≈ ${dVal(((asset.balance + (asset.stakedBalance || 0)) * asset.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 }))} USD
                   </p>
                </div>
                
                {asset.stakedBalance > 0 && (
                   <div className="flex items-center gap-2 text-xs bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                      <Lock size={12} className="text-indigo-400" />
                      <span className="text-indigo-300">Staked: {dVal(asset.stakedBalance.toLocaleString())} {asset.symbol}</span>
                   </div>
                )}
              </div>
            </div>

            {/* Action Buttons (Only for Crypto) */}
            {asset.type === AssetType.CRYPTO && (
              <div className="grid grid-cols-2 gap-2 relative z-10 mt-auto">
                <button 
                  onClick={() => onSendCrypto(asset.id)}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Send size={12} /> Send
                </button>
                <button 
                   onClick={() => onReceiveCrypto(asset.id)}
                   className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <QrCode size={12} /> Receive
                </button>
              </div>
            )}
            
            {/* Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-white">Transaction History</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-3 text-slate-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-slate-300 text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="ALL">All Transactions</option>
                <option value="DEPOSIT">Deposits</option>
                <option value="WITHDRAW">Withdrawals</option>
                <option value="BUY">Buys</option>
                <option value="SELL">Sells</option>
                <option value="SWAP">Swaps</option>
                <option value="STAKE">Staking</option>
                <option value="UNSTAKE">Redemption</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="p-5">Type</th>
                <th className="p-5">Asset</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Date</th>
                <th className="p-5">Status</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No transactions found. Start trading to populate this log.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="text-sm hover:bg-slate-700/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'DEPOSIT' || tx.type === 'BUY' || tx.type === 'UNSTAKE' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.type === 'WITHDRAW' || tx.type === 'SELL' || tx.type === 'STAKE' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={16} /> :
                           tx.type === 'WITHDRAW' ? <ArrowUpRight size={16} /> :
                           tx.type === 'STAKE' ? <Lock size={16} /> :
                           tx.type === 'UNSTAKE' ? <Coins size={16} /> :
                           <ArrowRightLeft size={16} />}
                        </div>
                        <span className="font-medium text-white capitalize">{tx.type.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="p-5 font-medium text-slate-300">
                      {tx.type === 'SWAP' ? (
                        <span className="flex items-center gap-1">
                          {tx.fromSymbol} <span className="text-slate-500">→</span> {tx.toSymbol}
                        </span>
                      ) : (
                        tx.toSymbol || tx.fromSymbol
                      )}
                    </td>
                    <td className="p-5 text-white font-mono">
                      {tx.type === 'WITHDRAW' || tx.type === 'SELL' || tx.type === 'STAKE' ? '-' : '+'}
                      {dVal(tx.toAmount > 0 ? tx.toAmount.toLocaleString() : tx.fromAmount.toLocaleString())} <span className="text-xs text-slate-500">{tx.toSymbol || tx.fromSymbol}</span>
                      {tx.fee && tx.fee > 0 && (
                        <div className="text-[10px] text-slate-500">Fee: {dVal(tx.fee.toFixed(4))}</div>
                      )}
                    </td>
                    <td className="p-5 text-slate-400 text-xs">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-700 text-slate-400 border-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                           tx.status === 'COMPLETED' ? 'bg-emerald-400' : 
                           tx.status === 'PENDING' ? 'bg-amber-400' : 'bg-slate-400'
                        }`}></span>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                       <Receipt size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};