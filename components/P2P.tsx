
import React, { useState, useEffect, useRef } from 'react';
import { Asset, P2PAd, P2POrder, P2PChatMessage, UserProfile } from '../types';
import { MOCK_P2P_ADS } from '../constants';
import { Search, Filter, Star, ShieldCheck, Clock, MessageSquare, Send, CheckCircle2, AlertTriangle, ChevronRight, Briefcase, ThumbsUp, Timer, Plus, X, Trash2, Wallet, Coins } from 'lucide-react';

interface P2PProps {
  assets: Asset[];
  user: UserProfile;
  onOrderComplete: (order: P2POrder) => void;
  onOrderCreate: (order: P2POrder) => void;
  onOrderCancel: (order: P2POrder) => void;
}

export const P2P: React.FC<P2PProps> = ({ assets, user, onOrderComplete, onOrderCreate, onOrderCancel }) => {
  const [view, setView] = useState<'MARKET' | 'MY_ADS' | 'ORDERS'>('MARKET');
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY'); // User perspective in Market
  const [selectedAssetId, setSelectedAssetId] = useState('tether');
  
  // Market State
  const [ads, setAds] = useState<P2PAd[]>(MOCK_P2P_ADS);
  const [amountFilter, setAmountFilter] = useState('');
  
  // Post Ad State
  const [showPostAdModal, setShowPostAdModal] = useState(false);
  
  // Order Flow State
  const [selectedAd, setSelectedAd] = useState<P2PAd | null>(null);
  const [orderAmount, setOrderAmount] = useState('');
  const [activeOrder, setActiveOrder] = useState<P2POrder | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [error, setError] = useState('');

  // --- DERIVED STATE ---
  const filteredAds = ads.filter(ad => {
    // Filter out my own ads from the market view to prevent self-trading
    if (ad.makerName === user.name) return false;

    return (
      ad.type === mode && 
      ad.assetId === selectedAssetId &&
      (!amountFilter || (ad.minLimit <= Number(amountFilter) && ad.maxLimit >= Number(amountFilter)))
    );
  });

  const myAds = ads.filter(ad => ad.makerName === user.name);

  const selectedAssetData = assets.find(a => a.id === selectedAssetId);

  // --- HANDLERS ---

  const handlePostAd = (newAd: P2PAd) => {
    setAds([newAd, ...ads]);
    setShowPostAdModal(false);
    setView('MY_ADS');
  };

  const handleDeleteAd = (adId: string) => {
    setAds(ads.filter(a => a.id !== adId));
  };

  const handleCreateOrder = () => {
    setError('');
    if (!selectedAd || !orderAmount || Number(orderAmount) <= 0) return;
    if (selectedAd.price <= 0) return; // Prevention

    const cryptoAmt = Number(orderAmount) / selectedAd.price;
    
    // ESCROW CHECK: If Selling, ensure balance exists
    if (mode === 'SELL') {
      const asset = assets.find(a => a.id === selectedAd.assetId);
      if (!asset || asset.balance < cryptoAmt) {
        setError(`Insufficient ${asset?.symbol} balance for escrow lock.`);
        return;
      }
    }

    const newOrder: P2POrder = {
      id: `p2p_${Date.now()}`,
      adId: selectedAd.id,
      type: mode, // This matches the User's intent (BUY/SELL)
      assetSymbol: selectedAssetData?.symbol || 'Crypto',
      fiatAmount: Number(orderAmount),
      cryptoAmount: cryptoAmt,
      price: selectedAd.price,
      counterpartyName: selectedAd.makerName,
      status: 'CREATED',
      created: new Date().toISOString(),
      chatHistory: [
        { id: '1', sender: 'SYSTEM', text: `Order Created. ${mode === 'SELL' ? 'Assets locked in escrow.' : 'Please complete payment.'}`, timestamp: new Date().toISOString() }
      ],
      paymentDetails: {
        bankName: 'GTBank',
        accountNumber: '0123456789',
        accountName: selectedAd.makerName.toUpperCase()
      }
    };

    onOrderCreate(newOrder); // Trigger App-level Escrow Lock
    setActiveOrder(newOrder);
    setSelectedAd(null); // Close input modal
    setOrderAmount('');
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !activeOrder) return;
    const msg: P2PChatMessage = {
      id: Date.now().toString(),
      sender: 'ME',
      text: chatMessage,
      timestamp: new Date().toISOString()
    };
    
    setActiveOrder(prev => prev ? ({
      ...prev,
      chatHistory: [...prev.chatHistory, msg]
    }) : null);
    
    setChatMessage('');

    // Mock Reply
    setTimeout(() => {
       const reply: P2PChatMessage = {
         id: (Date.now() + 1).toString(),
         sender: 'COUNTERPARTY',
         text: mode === 'BUY' ? "I'm online. Please proceed with payment." : "Checking my bank app now.",
         timestamp: new Date().toISOString()
       };
       setActiveOrder(prev => prev ? ({ ...prev, chatHistory: [...prev.chatHistory, reply] }) : null);
    }, 2000);
  };

  const markPaid = () => {
    if(!activeOrder) return;
    setActiveOrder({ ...activeOrder, status: 'PAID' });
  };

  const releaseCrypto = () => {
    if(!activeOrder) return;
    // Handled by parent to trigger PIN check
    onOrderComplete(activeOrder);
    setActiveOrder(null); // Close order view
  };

  const cancelOrder = () => {
    if (!activeOrder) return;
    if (activeOrder.type === 'SELL') {
      onOrderCancel(activeOrder); // Refund Escrow
    }
    setActiveOrder(null);
  };


  // --- SUB-COMPONENTS ---

  const PostAdModal = () => {
    if (!showPostAdModal) return null;
    
    // Local form state
    const [side, setSide] = useState<'SELL' | 'BUY'>('SELL'); // Maker perspective: I want to SELL crypto
    const [asset, setAsset] = useState('tether');
    const [price, setPrice] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [minLimit, setMinLimit] = useState('');
    const [maxLimit, setMaxLimit] = useState('');
    const [step, setStep] = useState(1);
    const [formError, setFormError] = useState('');

    const assetDetails = assets.find(a => a.id === asset);

    // Reset when closing
    const close = () => {
      setShowPostAdModal(false);
      setStep(1);
      setPrice('');
      setTotalAmount('');
      setMinLimit('');
      setMaxLimit('');
      setFormError('');
    }

    const handleSubmit = () => {
       if (Number(price) <= 0 || Number(totalAmount) <= 0 || Number(minLimit) <= 0 || Number(maxLimit) <= 0) {
         setFormError('All values must be positive');
         return;
       }
       
       // If I want to Sell, I need balance
       if (side === 'SELL') {
          if (!assetDetails || assetDetails.balance < Number(totalAmount)) {
             setFormError(`Insufficient ${assetDetails?.symbol} balance to post ad.`);
             return;
          }
       }

       const newAd: P2PAd = {
         id: `ad_${Date.now()}`,
         // Logic: If Maker wants to SELL, the Ad Type shown to Takers is 'BUY'
         type: side === 'SELL' ? 'BUY' : 'SELL', 
         assetId: asset,
         makerName: user.name,
         makerAvatar: undefined,
         completionRate: 100,
         totalOrders: 0,
         price: Number(price),
         minLimit: Number(minLimit),
         maxLimit: Number(maxLimit),
         availableAmount: Number(totalAmount),
         paymentMethods: ['Bank Transfer']
       };
       handlePostAd(newAd);
       // Reset handled by parent re-render but mostly explicit reset is safer if component stays mounted
       setStep(1);
       setPrice('');
       setTotalAmount('');
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
             <h3 className="text-xl font-bold text-white">Post New Ad</h3>
             <button onClick={close} className="text-slate-400 hover:text-white"><X size={24} /></button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
             {/* Step Indicator */}
             <div className="flex items-center gap-2 mb-4">
                <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
             </div>

             {step === 1 && (
               <div className="space-y-6 animate-slide-in">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">I want to</label>
                     <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button 
                          onClick={() => setSide('SELL')}
                          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${side === 'SELL' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                          Sell Crypto
                        </button>
                        <button 
                          onClick={() => setSide('BUY')}
                          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${side === 'BUY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                          Buy Crypto
                        </button>
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Asset</label>
                     <div className="grid grid-cols-3 gap-2">
                        {assets.filter(a => a.type === 'CRYPTO').map(a => (
                           <button 
                             key={a.id}
                             onClick={() => setAsset(a.id)}
                             className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 transition-all ${asset === a.id ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                           >
                              <span>{a.symbol}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Price Setting</label>
                     <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm text-white font-medium">Fixed Price</span>
                           <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded">NGN</span>
                        </div>
                        <input 
                          type="number"
                          value={price}
                          step="any"
                          onChange={(e) => setPrice(e.target.value.replace('-', ''))}
                          placeholder="e.g. 1550.00"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-bold text-lg outline-none focus:border-indigo-500"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                           Current Market Price: <span className="text-emerald-400">≈ ₦{(assetDetails ? assetDetails.priceUsd * 1550 : 0).toLocaleString()}</span>
                        </p>
                     </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    disabled={!price || !asset || Number(price) <= 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl mt-4"
                  >
                     Next Step
                  </button>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-6 animate-slide-in">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Total Amount</label>
                     <div className="relative">
                        <input 
                           type="number"
                           value={totalAmount}
                           step="any"
                           onChange={(e) => setTotalAmount(e.target.value.replace('-', ''))}
                           className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                           placeholder="0.00"
                        />
                        <span className="absolute right-4 top-3 text-slate-400 font-bold">{assetDetails?.symbol}</span>
                     </div>
                     <p className="text-xs text-slate-500 mt-2">
                        Available Balance: {assetDetails?.balance.toFixed(4)} {assetDetails?.symbol}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Min Limit (NGN)</label>
                        <input 
                           type="number"
                           value={minLimit}
                           onChange={(e) => setMinLimit(e.target.value.replace('-', ''))}
                           className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                           placeholder="5,000"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Max Limit (NGN)</label>
                        <input 
                           type="number"
                           value={maxLimit}
                           onChange={(e) => setMaxLimit(e.target.value.replace('-', ''))}
                           className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                           placeholder="1,000,000"
                        />
                     </div>
                  </div>
                  
                  {formError && (
                    <div className="bg-rose-500/10 text-rose-400 text-xs p-3 rounded-lg border border-rose-500/20 flex items-center gap-2">
                       <AlertTriangle size={14} /> {formError}
                    </div>
                  )}

                  <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                     <h4 className="text-sm font-bold text-white mb-2">Summary</h4>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                           <span className="text-slate-400">Type</span>
                           <span className={side === 'SELL' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{side} {assetDetails?.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-slate-400">Price</span>
                           <span className="text-white font-bold">₦{Number(price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-slate-400">Total Value</span>
                           <span className="text-white font-bold">₦{(Number(price) * Number(totalAmount)).toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <button onClick={() => setStep(1)} className="flex-1 text-slate-400 font-bold hover:text-white">Back</button>
                     <button 
                        onClick={handleSubmit}
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20"
                     >
                        Post Ad
                     </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const OrderInputModal = () => {
    if (!selectedAd) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
             <h3 className="text-xl font-bold text-white">{mode === 'BUY' ? 'Buy' : 'Sell'} {selectedAssetData?.symbol}</h3>
             <p className="text-slate-400 text-sm">from {selectedAd.makerName}</p>
          </div>
          <div className="p-6 space-y-4">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                   <span>Price</span>
                   <span className="text-emerald-400 font-bold">₦{selectedAd.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                   <span>Limit</span>
                   <span>₦{selectedAd.minLimit.toLocaleString()} - ₦{selectedAd.maxLimit.toLocaleString()}</span>
                </div>
             </div>

             <div>
               <label className="text-xs font-bold text-slate-500 uppercase">I want to pay</label>
               <div className="relative mt-1">
                 <input 
                   type="number"
                   value={orderAmount}
                   step="any"
                   onChange={(e) => setOrderAmount(e.target.value.replace('-', ''))}
                   className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                   placeholder="10000"
                 />
                 <span className="absolute right-4 top-3 text-slate-400 font-bold">NGN</span>
               </div>
             </div>
             
             <div className="flex justify-center">
                <div className="bg-slate-800 rounded-full p-2 border border-slate-700">
                   <ChevronRight className="rotate-90 text-slate-500" size={20} />
                </div>
             </div>

             <div>
               <label className="text-xs font-bold text-slate-500 uppercase">I will receive</label>
               <div className="relative mt-1">
                 <input 
                   type="number"
                   readOnly
                   value={orderAmount ? (Number(orderAmount) / selectedAd.price).toFixed(6) : ''}
                   className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-emerald-400 font-bold outline-none"
                   placeholder="0.00"
                 />
                 <span className="absolute right-4 top-3 text-slate-400 font-bold">{selectedAssetData?.symbol}</span>
               </div>
             </div>
             
             {error && (
                <div className="bg-rose-500/10 text-rose-400 text-xs p-3 rounded-lg border border-rose-500/20 flex items-center gap-2">
                   <AlertTriangle size={14} /> {error}
                </div>
             )}

             <div className="pt-2 flex gap-3">
               <button onClick={() => setSelectedAd(null)} className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors">Cancel</button>
               <button 
                  onClick={handleCreateOrder}
                  disabled={!orderAmount || Number(orderAmount) < selectedAd.minLimit || Number(orderAmount) > selectedAd.maxLimit || Number(orderAmount) <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
               >
                 {mode === 'BUY' ? 'Buy' : 'Sell'} 0 Fee
               </button>
             </div>
          </div>
        </div>
      </div>
    )
  };

  const ActiveOrderRoom = () => {
    if (!activeOrder) return null;
    const isBuyer = activeOrder.type === 'BUY'; // Current user is Buyer
    
    return (
      <div className="fixed inset-0 z-40 bg-[#0f172a] flex flex-col md:flex-row font-inter animate-fade-in">
         {/* HEADER MOBILE */}
         <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Order #{activeOrder.id.slice(-6)}</h3>
            <button onClick={() => setActiveOrder(null)} className="text-slate-400">Close</button>
         </div>

         {/* LEFT: ORDER INFO */}
         <div className="flex-1 p-6 md:p-12 overflow-y-auto border-r border-slate-800">
            <div className="max-w-xl mx-auto space-y-8">
               
               {/* Status Banner */}
               <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                     {activeOrder.status === 'CREATED' ? <Timer className="text-amber-400" size={32} /> : <CheckCircle2 className="text-emerald-400" size={32} />}
                     <div>
                        <h2 className="text-2xl font-bold text-white">
                          {activeOrder.status === 'CREATED' 
                            ? (isBuyer ? 'Please make payment' : 'Assets Escrowed. Waiting for payment.') 
                            : (isBuyer ? 'Payment marked. Waiting release.' : 'Buyer has paid. Confirm & Release.')}
                        </h2>
                        {activeOrder.status === 'CREATED' && <p className="text-amber-400 font-mono text-lg">14:59</p>}
                     </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {isBuyer 
                      ? "Transfer the exact amount to the seller's bank account below." 
                      : "Your assets are safely locked in escrow. Do not release until you confirm funds in your bank."}
                  </p>
               </div>

               {/* Order Details */}
               <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Order Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-800/50 p-3 rounded-xl">
                        <span className="text-xs text-slate-500 uppercase">Fiat Amount</span>
                        <p className="text-xl font-bold text-white">₦{activeOrder.fiatAmount.toLocaleString()}</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl">
                        <span className="text-xs text-slate-500 uppercase">Crypto Amount</span>
                        <p className="text-xl font-bold text-emerald-400">{activeOrder.cryptoAmount.toFixed(6)} {activeOrder.assetSymbol}</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl">
                        <span className="text-xs text-slate-500 uppercase">Price</span>
                        <p className="text-white font-medium">₦{activeOrder.price.toLocaleString()}</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl">
                        <span className="text-xs text-slate-500 uppercase">Order ID</span>
                        <p className="text-white font-medium font-mono">#{activeOrder.id.slice(-8)}</p>
                     </div>
                  </div>
               </div>

               {/* Payment Details */}
               {activeOrder.paymentDetails && (
                 <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase mb-4 flex items-center gap-2">
                       <Briefcase size={16} /> Bank Details
                    </h3>
                    <div className="space-y-3">
                       <div className="flex justify-between">
                          <span className="text-slate-400">Bank Name</span>
                          <span className="text-white font-bold">{activeOrder.paymentDetails.bankName}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-400">Account Number</span>
                          <span className="text-white font-bold font-mono tracking-wider">{activeOrder.paymentDetails.accountNumber}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-400">Account Name</span>
                          <span className="text-white font-bold">{activeOrder.paymentDetails.accountName}</span>
                       </div>
                    </div>
                 </div>
               )}

               {/* Actions */}
               <div className="flex gap-4 pt-4">
                  {isBuyer && activeOrder.status === 'CREATED' && (
                     <>
                      <button onClick={cancelOrder} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl">Cancel Order</button>
                      <button onClick={markPaid} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20">I Have Paid</button>
                     </>
                  )}
                  {!isBuyer && activeOrder.status === 'PAID' && (
                     <>
                      <button className="flex-1 bg-rose-900/50 text-rose-400 font-bold py-4 rounded-xl border border-rose-900 hover:bg-rose-900">Appeal</button>
                      <button onClick={releaseCrypto} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20">Payment Received, Release Crypto</button>
                     </>
                  )}
                  {!isBuyer && activeOrder.status === 'CREATED' && (
                     <div className="w-full text-center text-slate-500 p-4 bg-slate-800/50 rounded-xl">
                        Waiting for buyer to pay...
                     </div>
                  )}
                  {isBuyer && activeOrder.status === 'PAID' && (
                     <div className="w-full text-center text-slate-500 p-4 bg-slate-800/50 rounded-xl">
                        You have marked as paid. Waiting for seller to release.
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* RIGHT: CHAT */}
         <div className="w-full md:w-[400px] flex flex-col bg-slate-900 border-l border-slate-800">
            <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                     {activeOrder.counterpartyName.charAt(0)}
                  </div>
                  <div>
                     <h3 className="font-bold text-white">{activeOrder.counterpartyName}</h3>
                     <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online</p>
                  </div>
               </div>
               <button onClick={() => setActiveOrder(null)} className="hidden md:block text-slate-400 hover:text-white">Close</button>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
               <div className="text-center">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
                     Messages are end-to-end encrypted
                  </span>
               </div>
               {activeOrder.chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'ME' ? 'justify-end' : 'justify-start'}`}>
                     {msg.sender === 'SYSTEM' ? (
                        <div className="w-full text-center my-2">
                           <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">{msg.text}</span>
                        </div>
                     ) : (
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'ME' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                           {msg.text}
                           <p className="text-[10px] opacity-50 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                     )}
                  </div>
               ))}
            </div>

            <div className="p-4 bg-slate-800/30 border-t border-slate-800">
               <div className="flex gap-2">
                  <input 
                     type="text" 
                     value={chatMessage}
                     onChange={(e) => setChatMessage(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                     placeholder="Type a message..."
                     className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors">
                     <Send size={20} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen animate-fade-in pb-20">
      <OrderInputModal />
      <ActiveOrderRoom />
      <PostAdModal />

      {/* Top Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               P2P Trading <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded uppercase font-bold tracking-wide">Zero Fees</span>
            </h2>
            <p className="text-slate-400 text-sm">Buy and sell crypto directly with other users via bank transfer.</p>
         </div>
         <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button 
               onClick={() => setView('MARKET')} 
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'MARKET' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
               Marketplace
            </button>
            <button 
               onClick={() => setView('MY_ADS')} 
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'MY_ADS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
               My Ads
            </button>
            <button 
               onClick={() => setView('ORDERS')} 
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'ORDERS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
               Orders
            </button>
         </div>
      </div>

      {view === 'MARKET' && (
         <>
            {/* Filters */}
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-6 flex flex-wrap gap-4 items-center">
               <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-600">
                  <button onClick={() => setMode('BUY')} className={`px-6 py-2 rounded-md font-bold text-sm transition-colors ${mode === 'BUY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Buy</button>
                  <button onClick={() => setMode('SELL')} className={`px-6 py-2 rounded-md font-bold text-sm transition-colors ${mode === 'SELL' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>Sell</button>
               </div>
               
               <div className="h-8 w-px bg-slate-700 mx-2 hidden md:block"></div>

               <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {assets.filter(a => a.type === 'CRYPTO').map(asset => (
                     <button
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all whitespace-nowrap ${selectedAssetId === asset.id ? 'bg-slate-700 border-indigo-500 text-white' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}
                     >
                        {asset.symbol}
                     </button>
                  ))}
               </div>
               
               <div className="ml-auto relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                  <input 
                     type="number"
                     placeholder="Enter amount (NGN)"
                     value={amountFilter}
                     onChange={(e) => setAmountFilter(e.target.value.replace('-', ''))}
                     className="bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none w-full md:w-48"
                  />
               </div>
            </div>

            {/* Ad List */}
            <div className="space-y-4">
               {filteredAds.length === 0 ? (
                  <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-800 border-dashed">
                     <Filter className="mx-auto text-slate-600 mb-4" size={48} />
                     <h3 className="text-lg font-bold text-slate-400">No Ads Found</h3>
                     <p className="text-slate-500 text-sm">Try changing your filters or asset.</p>
                  </div>
               ) : (
                  filteredAds.map((ad) => (
                     <div key={ad.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all flex flex-col md:flex-row justify-between items-center gap-6 group">
                        
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                 {ad.makerName.charAt(0)}
                              </div>
                              <div>
                                 <h3 className="font-bold text-white flex items-center gap-2">
                                    {ad.makerName} 
                                    <ShieldCheck size={14} className="text-emerald-400" />
                                 </h3>
                                 <p className="text-xs text-slate-400 flex items-center gap-2">
                                    <span>{ad.totalOrders} orders</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    <span className="text-emerald-400">{ad.completionRate}% completion</span>
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="flex-1 md:text-center w-full md:w-auto">
                           <div className="flex justify-between md:justify-center items-end gap-1 mb-1">
                              <span className="text-xs text-slate-500 mb-1">Price</span>
                              <p className="text-2xl font-bold text-white">₦{ad.price.toLocaleString()}</p>
                           </div>
                           <p className="text-xs text-slate-400 md:text-center">
                              Limit: ₦{ad.minLimit.toLocaleString()} - ₦{ad.maxLimit.toLocaleString()}
                           </p>
                        </div>

                        <div className="flex-1 w-full md:w-auto">
                           <div className="flex flex-wrap gap-2 justify-start md:justify-end mb-4">
                              {ad.paymentMethods.map(pm => (
                                 <span key={pm} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600 relative top-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                                    {pm}
                                 </span>
                              ))}
                           </div>
                           <button 
                              onClick={() => setSelectedAd(ad)}
                              className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                                 mode === 'BUY' 
                                 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' 
                                 : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                              }`}
                           >
                              {mode === 'BUY' ? 'Buy' : 'Sell'} {selectedAssetData?.symbol}
                           </button>
                        </div>

                     </div>
                  ))
               )}
            </div>
         </>
      )}

      {view === 'MY_ADS' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
               <div>
                  <h3 className="text-xl font-bold text-white">Merchant Dashboard</h3>
                  <p className="text-slate-400 text-sm">Manage your active advertisements</p>
               </div>
               <button 
                  onClick={() => setShowPostAdModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20"
               >
                  <Plus size={20} /> Post New Ad
               </button>
            </div>

            {myAds.length === 0 ? (
               <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-800 border-dashed">
                  <Briefcase className="mx-auto text-slate-600 mb-4" size={48} />
                  <h3 className="text-lg font-bold text-slate-400">No Active Ads</h3>
                  <p className="text-slate-500 text-sm mb-6">Create ads to buy or sell crypto at your own price.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {myAds.map(ad => (
                     <div key={ad.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center group">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${ad.type === 'BUY' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                 {ad.type === 'BUY' ? 'SELL' : 'BUY'} SIDE
                              </span>
                              <h3 className="font-bold text-white">{assets.find(a => a.id === ad.assetId)?.name}</h3>
                           </div>
                           <p className="text-2xl font-bold text-white">₦{ad.price.toLocaleString()}</p>
                           <p className="text-xs text-slate-400 mt-1">
                              Limit: ₦{ad.minLimit.toLocaleString()} - ₦{ad.maxLimit.toLocaleString()}
                           </p>
                        </div>
                        <div className="text-right">
                           <div className="flex items-center justify-end gap-4 text-sm text-slate-400 mb-4">
                              <span>Available: {ad.availableAmount}</span>
                              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500" /> Active</span>
                           </div>
                           <div className="flex gap-2">
                              <button className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-bold hover:bg-slate-600">Edit</button>
                              <button 
                                 onClick={() => handleDeleteAd(ad.id)}
                                 className="px-4 py-2 rounded-lg bg-rose-900/30 text-rose-400 text-sm font-bold hover:bg-rose-900/50 border border-rose-900/50 flex items-center gap-2"
                              >
                                 <Trash2 size={16} /> Close
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      )}
      
      {view === 'ORDERS' && (
         <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-800 border-dashed">
            <Clock className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-400">No Active Orders</h3>
            <p className="text-slate-500 text-sm">Your order history will appear here.</p>
         </div>
      )}

    </div>
  );
};
