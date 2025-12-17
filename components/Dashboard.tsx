
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Asset, AssetType, MarketDataPoint } from '../types';
import { NGN_USD_RATE } from '../constants';
import { Wallet, TrendingUp, TrendingDown, CreditCard, EyeOff } from 'lucide-react';

interface DashboardProps {
  assets: Asset[];
  chartData: MarketDataPoint[];
  onDeposit: () => void;
  isPrivacyMode?: boolean; // New Prop
}

export const Dashboard: React.FC<DashboardProps> = ({ assets, chartData, onDeposit, isPrivacyMode = false }) => {
  const totalBalanceUSD = assets.reduce((acc, asset) => {
    if (asset.type === AssetType.FIAT) return acc + (asset.balance / NGN_USD_RATE);
    return acc + (asset.balance * asset.priceUsd);
  }, 0);

  const totalBalanceNGN = totalBalanceUSD * NGN_USD_RATE;

  // Helper to mask values
  const displayValue = (val: string) => isPrivacyMode ? '****' : val;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} className="text-emerald-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
            Total Balance (NGN) {isPrivacyMode && <EyeOff size={12} />}
          </p>
          <h2 className="text-3xl font-bold text-white mb-2">
            ₦{displayValue(totalBalanceNGN.toLocaleString(undefined, { maximumFractionDigits: 2 }))}
          </h2>
          <p className="text-emerald-400 text-sm flex items-center gap-1">
            <TrendingUp size={14} /> +2.4% (24h)
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
             Total Balance (USD) {isPrivacyMode && <EyeOff size={12} />}
          </p>
          <h2 className="text-3xl font-bold text-white mb-2">
            ${displayValue(totalBalanceUSD.toLocaleString(undefined, { maximumFractionDigits: 2 }))}
          </h2>
          <p className="text-slate-500 text-sm">~ Global Avg.</p>
        </div>

        <div 
          onClick={onDeposit}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center items-start cursor-pointer hover:shadow-indigo-500/30 transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="text-white/80" />
            <h3 className="font-semibold">Quick Action</h3>
          </div>
          <p className="text-indigo-100 text-sm mb-4">Deposit NGN to start trading crypto instantly.</p>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full">
            Deposit NGN
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-semibold text-white">Market Performance</h3>
           <div className="flex gap-2">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full animate-pulse">LIVE</span>
           </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${(value/1000).toFixed(1)}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini Asset List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-semibold text-white">Top Assets</h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
        </div>
        <div>
          {assets.slice(0, 4).map((asset) => (
            <div key={asset.id} className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0">
              <div className="flex items-center gap-3">
                <img src={asset.iconUrl} alt={asset.name} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="font-medium text-white">{asset.name}</p>
                  <p className="text-xs text-slate-400">{asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">
                  {isPrivacyMode ? '****' : (
                    <>
                      {asset.symbol === 'NGN' ? '₦' : ''}{asset.balance.toLocaleString()} {asset.symbol !== 'NGN' ? asset.symbol : ''}
                    </>
                  )}
                </p>
                <p className={`text-xs flex items-center justify-end gap-1 ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {asset.change24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(asset.change24h)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};