import React, { useState } from 'react';
import { Asset, AssetType } from '../types';
import { TrendingUp, ShieldCheck, Lock, Unlock, ArrowRight, Percent, AlertCircle } from 'lucide-react';

interface EarnProps {
  assets: Asset[];
  onStake: (assetId: string, amount: number) => void;
  onUnstake: (assetId: string, amount: number) => void;
}

const APY_RATES: Record<string, number> = {
  'naira': 15.5,
  'tether': 8.0,
  'usd-coin': 8.0,
  'ethereum': 4.5,
  'bitcoin': 2.0,
  'solana': 6.5
};

export const Earn: React.FC<EarnProps> = ({ assets, onStake, onUnstake }) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [action, setAction] = useState<'STAKE' | 'UNSTAKE'>('STAKE');
  const [amount, setAmount] = useState('');

  const supportedAssets = assets.filter(a => APY_RATES[a.id]);

  const handleAction = () => {
    if (!selectedAsset || !amount || isNaN(Number(amount))) return;
    if (Number(amount) <= 0) return;

    if (action === 'STAKE') {
      onStake(selectedAsset.id, Number(amount));
    } else {
      onUnstake(selectedAsset.id, Number(amount));
    }
    setAmount('');
    setSelectedAsset(null);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 relative overflow-hidden border border-indigo-700/50 shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg">
                <TrendingUp size={20} />
             </div>
             <span className="text-emerald-400 font-bold tracking-wide text-sm uppercase">Klastech Earn</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Grow your wealth while you sleep</h2>
          <p className="text-indigo-200 mb-6">
            Earn up to <span className="text-white font-bold">15.5% APY</span> on NGN and stablecoins. Interest paid daily. Flexible withdrawals.
          </p>
          <div className="flex gap-4 text-xs font-medium text-indigo-300">
             <div className="flex items-center gap-1"><ShieldCheck size={14} /> Bank-Grade Security</div>
             <div className="flex items-center gap-1"><Unlock size={14} /> No Lock-in Period</div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
        <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Asset List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            Available Assets <span className="text-slate-500 text-sm font-normal">({supportedAssets.length})</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedAssets.map(asset => (
              <div key={asset.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-5 hover:border-indigo-500 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={asset.iconUrl} alt={asset.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h4 className="font-bold text-white">{asset.name}</h4>
                      <p className="text-xs text-slate-400">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                    {APY_RATES[asset.id]}% APY
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Available:</span>
                      <span className="text-white font-mono">{asset.balance.toLocaleString()} {asset.symbol}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Staked:</span>
                      <span className="text-indigo-400 font-mono font-bold">{asset.stakedBalance.toLocaleString()} {asset.symbol}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setSelectedAsset(asset); setAction('STAKE'); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Stake
                  </button>
                  <button 
                     onClick={() => { setSelectedAsset(asset); setAction('UNSTAKE'); }}
                     disabled={asset.stakedBalance <= 0}
                     className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Unstake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel (Sticky) */}
        <div className="lg:col-span-1">
          {selectedAsset ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sticky top-24 shadow-xl animate-slide-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {action === 'STAKE' ? 'Subscribe to Earn' : 'Redeem Assets'}
                </h3>
                <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-white">Close</button>
              </div>

              <div className="flex flex-col items-center mb-6">
                 <img src={selectedAsset.iconUrl} alt={selectedAsset.name} className="w-16 h-16 rounded-full mb-3" />
                 <span className="text-2xl font-bold text-white">{selectedAsset.symbol}</span>
                 <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
                    {APY_RATES[selectedAsset.id]}% APY
                 </span>
              </div>

              <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                     Amount to {action === 'STAKE' ? 'Stake' : 'Redeem'}
                   </label>
                   <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 flex items-center gap-2 focus-within:border-indigo-500 transition-colors">
                     <input 
                       type="number" 
                       value={amount}
                       onChange={(e) => setAmount(e.target.value)}
                       placeholder="0.00"
                       className="bg-transparent text-white font-bold text-lg w-full outline-none"
                     />
                     <button 
                       onClick={() => setAmount(action === 'STAKE' ? selectedAsset.balance.toString() : selectedAsset.stakedBalance.toString())}
                       className="text-xs text-indigo-400 font-bold hover:text-indigo-300 uppercase"
                     >
                       Max
                     </button>
                   </div>
                   <p className="text-xs text-slate-500 mt-2 text-right">
                     Available: {action === 'STAKE' ? selectedAsset.balance.toFixed(6) : selectedAsset.stakedBalance.toFixed(6)} {selectedAsset.symbol}
                   </p>
                </div>

                {action === 'STAKE' && amount && !isNaN(Number(amount)) && (
                   <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Est. Daily Interest</span>
                        <span className="text-emerald-400 font-bold">
                           +{(Number(amount) * (APY_RATES[selectedAsset.id] / 100) / 365).toFixed(6)} {selectedAsset.symbol}
                        </span>
                      </div>
                   </div>
                )}
                
                {amount && Number(amount) > (action === 'STAKE' ? selectedAsset.balance : selectedAsset.stakedBalance) && (
                   <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-2 rounded-lg">
                      <AlertCircle size={12} /> Insufficient Balance
                   </div>
                )}

                <button 
                  onClick={handleAction}
                  disabled={!amount || Number(amount) <= 0 || Number(amount) > (action === 'STAKE' ? selectedAsset.balance : selectedAsset.stakedBalance)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                   {action === 'STAKE' ? <Lock size={18} /> : <Unlock size={18} />}
                   {action === 'STAKE' ? 'Confirm Stake' : 'Redeem Funds'}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col items-center justify-center text-center h-64 opacity-50 border-dashed">
               <Percent size={48} className="text-slate-600 mb-4" />
               <p className="text-slate-400 font-medium">Select an asset to view staking details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};