
import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '../types';
import { NGN_USD_RATE } from '../constants';
import { ArrowDownUp, Info, RotateCcw, ArrowRight, SlidersHorizontal, AlertCircle, XCircle } from 'lucide-react';

interface TradeProps {
  assets: Asset[];
  onTrade: (type: 'BUY' | 'SELL' | 'SWAP', fromId: string, toId: string, amount: number, orderType: 'MARKET' | 'LIMIT', limitPrice?: number) => void;
  feePercentage: number; // New Prop for dynamic fee
}

export const Trade: React.FC<TradeProps> = ({ assets, onTrade, feePercentage }) => {
  const [mode, setMode] = useState<'BUY' | 'SELL' | 'SWAP'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  
  const [payAssetId, setPayAssetId] = useState<string>('');
  const [receiveAssetId, setReceiveAssetId] = useState<string>('');
  
  const [amount, setAmount] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [estimatedOutput, setEstimatedOutput] = useState<string>('0.00');
  const [error, setError] = useState<string>('');
  
  // Set defaults based on mode
  useEffect(() => {
    setError('');
    if (mode === 'BUY') {
      setPayAssetId('naira');
      setReceiveAssetId('bitcoin');
    } else if (mode === 'SELL') {
      setPayAssetId('bitcoin');
      setReceiveAssetId('naira');
    } else {
      setPayAssetId('bitcoin');
      setReceiveAssetId('ethereum');
    }
    setAmount('');
    setLimitPrice('');
  }, [mode]);

  // Pre-fill limit price
  useEffect(() => {
    const receiveAsset = assets.find(a => a.id === receiveAssetId);
    const payAsset = assets.find(a => a.id === payAssetId);

    if (orderType === 'LIMIT') {
      if (mode === 'BUY' && receiveAsset) {
        setLimitPrice((receiveAsset.priceUsd * (receiveAsset.type === AssetType.FIAT ? 1 : NGN_USD_RATE)).toString());
      } else if (mode === 'SELL' && payAsset) {
         setLimitPrice((payAsset.priceUsd * (payAsset.type === AssetType.FIAT ? 1 : NGN_USD_RATE)).toString());
      }
    }
  }, [orderType, receiveAssetId, payAssetId, mode, assets]);

  // Calculation Logic & Validation
  useEffect(() => {
    const payAsset = assets.find(a => a.id === payAssetId);
    const receiveAsset = assets.find(a => a.id === receiveAssetId);
    
    if (!payAsset || !receiveAsset || !amount || isNaN(Number(amount))) {
      setEstimatedOutput('0.00');
      return;
    }

    const inputVal = Number(amount);

    // Validation
    if (inputVal < 0) {
      setError('Amount cannot be negative');
    } else if (inputVal > payAsset.balance) {
      setError(`Insufficient ${payAsset.symbol} balance`);
    } else {
      setError('');
    }
    
    // Dynamic Fee Logic
    const feeMultiplier = 1 - feePercentage; 

    if (orderType === 'MARKET') {
      let usdValue = 0;
      if (payAsset.type === AssetType.FIAT) {
        usdValue = inputVal / NGN_USD_RATE;
      } else {
        usdValue = inputVal * payAsset.priceUsd;
      }

      let outputVal = 0;
      if (receiveAsset.type === AssetType.FIAT) {
        outputVal = usdValue * NGN_USD_RATE;
      } else {
        outputVal = usdValue / receiveAsset.priceUsd;
      }
      setEstimatedOutput((outputVal * feeMultiplier).toFixed(6));
    } else {
      if (!limitPrice || isNaN(Number(limitPrice))) {
         setEstimatedOutput('0.00');
         return;
      }
      const price = Number(limitPrice);

      if (mode === 'BUY') {
        setEstimatedOutput(((inputVal / price) * feeMultiplier).toFixed(6));
      } else if (mode === 'SELL') {
        setEstimatedOutput(((inputVal * price) * feeMultiplier).toFixed(2));
      } else {
        setEstimatedOutput('Calculated at execution'); 
      }
    }

  }, [amount, payAssetId, receiveAssetId, assets, orderType, limitPrice, mode, feePercentage]);

  const handleTrade = () => {
    if (error) return;
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    onTrade(
      mode, 
      payAssetId, 
      receiveAssetId, 
      Number(amount), 
      orderType, 
      orderType === 'LIMIT' ? Number(limitPrice) : undefined
    );
    setAmount('');
  };

  const handleClear = () => {
    setAmount('');
    setError('');
  }

  const payAsset = assets.find(a => a.id === payAssetId);
  const receiveAsset = assets.find(a => a.id === receiveAssetId);

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-slate-800 p-1 rounded-xl grid grid-cols-3 gap-1 shadow-lg border border-slate-700 w-3/4">
          {(['BUY', 'SELL', 'SWAP'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                mode === m 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        
        {/* Order Type Toggle */}
        <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
           <button 
             onClick={() => setOrderType('MARKET')}
             className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'MARKET' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
           >
             Market
           </button>
           <button 
             onClick={() => setOrderType('LIMIT')}
             className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'LIMIT' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
           >
             Limit
           </button>
        </div>
      </div>

      {/* Trade Card */}
      <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        {amount && (
           <button onClick={handleClear} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <RotateCcw size={16} />
           </button>
        )}

        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">
            You Pay
          </label>
          <div className={`bg-slate-900/50 rounded-2xl p-4 border transition-colors ${error ? 'border-rose-500/50' : 'border-slate-600 focus-within:border-indigo-500'}`}>
            <div className="flex justify-between items-center mb-2">
              <input 
                type="number" 
                value={amount}
                min="0"
                step="any"
                onChange={(e) => setAmount(e.target.value.replace('-', ''))}
                placeholder="0.00"
                className="bg-transparent text-3xl font-bold text-white outline-none w-2/3 placeholder-slate-600"
              />
              <select 
                value={payAssetId}
                onChange={(e) => setPayAssetId(e.target.value)}
                className="bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-600 outline-none text-sm font-medium hover:bg-slate-700 cursor-pointer"
                disabled={mode === 'BUY'} 
              >
                {assets
                  .filter(a => mode === 'BUY' ? a.type === AssetType.FIAT : a.type !== AssetType.FIAT)
                  .map(a => (
                  <option key={a.id} value={a.id}>{a.symbol}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span className={error ? "text-rose-400 font-medium" : ""}>
                {error || `Balance: ${payAsset?.balance.toLocaleString()} ${payAsset?.symbol}`}
              </span>
              <button 
                onClick={() => setAmount(payAsset ? payAsset.balance.toString() : '0')}
                className="text-indigo-400 hover:text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {orderType === 'LIMIT' && mode !== 'SWAP' && (
          <div className="mb-4 relative animate-fade-in">
             <div className="flex justify-center -my-6 z-10 relative pointer-events-none">
                <SlidersHorizontal size={16} className="text-slate-500 bg-slate-800 p-1 rounded-full border border-slate-600" />
             </div>
             <div className="mt-6 bg-slate-900/30 rounded-2xl p-4 border border-slate-600 border-dashed">
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Limit Price (NGN)</label>
                <input 
                  type="number" 
                  value={limitPrice}
                  step="any"
                  onChange={(e) => setLimitPrice(e.target.value.replace('-', ''))}
                  className="w-full bg-transparent text-xl font-bold text-indigo-400 outline-none"
                  placeholder="Enter target price..."
                />
             </div>
          </div>
        )}

        {orderType === 'MARKET' && (
          <div className="flex justify-center -my-3 relative z-10">
            <div className="bg-slate-700 p-2 rounded-full border-4 border-slate-800 text-slate-300 shadow-md">
              <ArrowDownUp size={20} />
            </div>
          </div>
        )}

        <div className="mt-4 mb-8">
          <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">
            You Receive (Est.)
          </label>
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-600">
            <div className="flex justify-between items-center mb-2">
              <input 
                type="text" 
                value={estimatedOutput}
                readOnly
                className="bg-transparent text-3xl font-bold text-emerald-400 outline-none w-2/3 cursor-default"
              />
              <select 
                value={receiveAssetId}
                onChange={(e) => setReceiveAssetId(e.target.value)}
                className="bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-600 outline-none text-sm font-medium hover:bg-slate-700 cursor-pointer"
                disabled={mode === 'SELL'}
              >
                 {assets
                  .filter(a => mode === 'SELL' ? a.type === AssetType.FIAT : a.type !== AssetType.FIAT)
                  .filter(a => a.id !== payAssetId)
                  .map(a => (
                  <option key={a.id} value={a.id}>{a.symbol}</option>
                ))}
              </select>
            </div>
             <div className="flex justify-between text-xs text-slate-400">
               <span>
                 {orderType === 'MARKET' ? 'Market Rate' : 'Limit Rate'}: 
                 1 {assets.find(a => a.id === receiveAssetId)?.symbol} ≈ 
                 {orderType === 'LIMIT' && limitPrice ? Number(limitPrice).toLocaleString() : ((receiveAsset?.priceUsd || 0) * NGN_USD_RATE).toLocaleString()} NGN
               </span>
               <span className="flex items-center gap-1 text-slate-500">
                 Fee: {(feePercentage * 100).toFixed(2)}%
               </span>
             </div>
          </div>
        </div>

        <button 
          onClick={handleTrade}
          disabled={!!error || !amount}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {error ? (
            <span className="flex items-center gap-2"><AlertCircle size={20} /> {error}</span>
          ) : (
            <>
              {orderType === 'LIMIT' ? `Place Limit Order` : (mode === 'BUY' ? 'Buy Crypto' : mode === 'SELL' ? 'Sell to Naira' : 'Swap Assets')}
              <ArrowRight size={20} />
            </>
          )}
        </button>

        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-700/20 p-3 rounded-lg">
          <Info size={14} className="mt-0.5 shrink-0" />
          <p>
            {orderType === 'LIMIT' 
              ? 'Limit orders will only execute when the market price reaches your set price. Assets are reserved until execution.'
              : `Market trades are executed instantly. A ${(feePercentage * 100).toFixed(2)}% fee is applied to the output amount.`}
          </p>
        </div>
      </div>
    </div>
  );
};
