
import React, { useState } from 'react';
import { 
  Building2, TrendingUp, DollarSign, ArrowRightLeft, Globe, 
  Wallet, ShieldCheck, Download, History, ChevronRight, Briefcase, 
  Landmark, CreditCard, Lock, RefreshCw, Send, CheckCircle2, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Asset, UserProfile, Transaction } from '../types';
import { NGN_USD_RATE } from '../constants';

interface CorporatePortalProps {
  user: UserProfile;
  assets: Asset[];
  onLogout: () => void;
  onTrade: (type: 'BUY' | 'SELL' | 'SWAP', fromId: string, toId: string, amount: number) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onSendCrypto: (assetId: string) => void;
  fxMarkup: number; // New Prop
  wireFee: number; // New Prop
}

export const CorporatePortal: React.FC<CorporatePortalProps> = ({ user, assets, onLogout, onTrade, onDeposit, onWithdraw, onSendCrypto, fxMarkup, wireFee }) => {
  const [activeView, setActiveView] = useState<'TREASURY' | 'FX_DESK' | 'WIRE_TRANSFER' | 'HISTORY'>('TREASURY');
  const [fxAmount, setFxAmount] = useState('');
  const [wireAmount, setWireAmount] = useState('');
  const [wireStep, setWireStep] = useState(1);
  const [beneficiary, setBeneficiary] = useState({ name: '', swift: '', account: '', bank: '' });

  const usdcAsset = assets.find(a => a.symbol === 'USDC');
  const ngnAsset = assets.find(a => a.symbol === 'NGN');
  
  const totalUsdValue = assets.reduce((acc, a) => {
     if(a.type === 'FIAT') return acc + (a.balance / NGN_USD_RATE);
     return acc + (a.balance * a.priceUsd);
  }, 0);

  // FX Handler
  const handleFxConversion = () => {
    if(!fxAmount || !ngnAsset || !usdcAsset) return;
    onTrade('BUY', ngnAsset.id, usdcAsset.id, Number(fxAmount));
    setFxAmount('');
    alert('FX Liquidity Request Submitted. Settlement is instant.');
  };

  // Wire Handler
  const handleWireTransfer = () => {
     setWireStep(2); // Processing
     setTimeout(() => {
        setWireStep(3); // Success
     }, 2000);
  };

  const InflationChartData = [
     { month: 'Jan', ngn: 100, usdc: 100 },
     { month: 'Feb', ngn: 92, usdc: 100 },
     { month: 'Mar', ngn: 85, usdc: 101 },
     { month: 'Apr', ngn: 78, usdc: 102 },
     { month: 'May', ngn: 70, usdc: 102 },
     { month: 'Jun', ngn: 65, usdc: 103 },
  ];

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-inter">
       
       {/* Corporate Sidebar */}
       <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800">
             <div className="flex items-center gap-2 mb-1">
                <div className="bg-cyan-600 text-white p-2 rounded-lg"><Building2 size={24} /></div>
                <div>
                   <h2 className="font-bold text-lg leading-tight">Klass Corporate</h2>
                   <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Merchant Portal</p>
                </div>
             </div>
          </div>

          <div className="p-6">
             <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Organization</p>
                <h3 className="font-bold text-white truncate">{user.organizationName || user.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{user.rcNumber || 'RC: N/A'}</p>
             </div>

             <nav className="space-y-2">
                <NavBtn active={activeView === 'TREASURY'} onClick={() => setActiveView('TREASURY')} icon={<Briefcase size={18} />} label="Treasury Dashboard" />
                <NavBtn active={activeView === 'FX_DESK'} onClick={() => setActiveView('FX_DESK')} icon={<RefreshCw size={18} />} label="FX Liquidity Desk" />
                <NavBtn active={activeView === 'WIRE_TRANSFER'} onClick={() => setActiveView('WIRE_TRANSFER')} icon={<Globe size={18} />} label="Global Payouts" />
                <NavBtn active={activeView === 'HISTORY'} onClick={() => setActiveView('HISTORY')} icon={<History size={18} />} label="Transaction History" />
             </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-800">
             <button onClick={onLogout} className="w-full flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 transition-colors text-sm font-bold">
                <Lock size={16} /> Secure Logout
             </button>
          </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 bg-[#0b1120] overflow-y-auto p-8">
          
          {activeView === 'TREASURY' && (
             <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                <header className="flex justify-between items-end">
                   <div>
                      <h1 className="text-3xl font-bold text-white">Corporate Treasury</h1>
                      <p className="text-slate-400 mt-1">Real-time overview of your company's liquidity and asset allocation.</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Liquidity (USD)</p>
                      <p className="text-3xl font-bold text-white font-mono">${totalUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                   </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* USDC CARD */}
                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-cyan-900/30 text-cyan-400 rounded-xl"><DollarSign size={24} /></div>
                         <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 font-bold">STABLECOIN</span>
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase">USDC Holdings</p>
                      <h3 className="text-2xl font-bold text-white mt-1 mb-1">{usdcAsset?.balance.toLocaleString()} USDC</h3>
                      <p className="text-xs text-slate-500 mb-6">≈ ₦{(usdcAsset ? (usdcAsset.balance * NGN_USD_RATE) : 0).toLocaleString()}</p>
                      
                      <div className="mt-auto grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => usdcAsset && onSendCrypto(usdcAsset.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                             <ArrowUpRight size={14} /> Send
                          </button>
                          <button className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                             <ArrowDownLeft size={14} /> Receive
                          </button>
                      </div>
                   </div>

                   {/* NAIRA CARD */}
                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-emerald-900/30 text-emerald-400 rounded-xl"><Landmark size={24} /></div>
                         <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 font-bold">FIAT</span>
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase">Naira Holdings</p>
                      <h3 className="text-2xl font-bold text-white mt-1 mb-1">₦{ngnAsset?.balance.toLocaleString()}</h3>
                      <p className="text-xs text-slate-500 mb-6">Available for FX Conversion</p>
                      
                      <div className="mt-auto grid grid-cols-2 gap-2">
                          <button 
                            onClick={onDeposit}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                             <ArrowDownLeft size={14} /> Add Funds
                          </button>
                          <button 
                             onClick={onWithdraw}
                             className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                             <ArrowUpRight size={14} /> Withdraw
                          </button>
                      </div>
                   </div>

                   {/* FX SHORTCUT */}
                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-center items-center text-center cursor-pointer hover:border-cyan-500 transition-colors" onClick={() => setActiveView('FX_DESK')}>
                      <div className="p-4 bg-slate-800 rounded-full mb-3 text-cyan-400"><RefreshCw size={24} /></div>
                      <h3 className="font-bold text-white">Instant FX Settlement</h3>
                      <p className="text-xs text-slate-400 mt-1">Convert NGN to USDC instantly</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                         <TrendingUp size={18} className="text-cyan-400" /> Inflation Hedge Tracker
                      </h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={InflationChartData}>
                               <defs>
                                  <linearGradient id="colorUsdc" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                               <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                               <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                               <Area type="monotone" dataKey="usdc" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorUsdc)" name="USDC Value" />
                               <Area type="monotone" dataKey="ngn" stroke="#ef4444" strokeWidth={3} fillOpacity={0} name="NGN Purchasing Power" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-2">Based on historical market data comparison.</p>
                   </div>

                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                      <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                         <ActionRow onClick={onDeposit} icon={<Wallet />} title="Deposit Naira" desc="Fund via bank transfer" />
                         <ActionRow onClick={onWithdraw} icon={<ArrowUpRight />} title="Withdraw Naira" desc="Transfer to corporate bank account" />
                         <ActionRow icon={<Globe />} title="Wire Transfer" desc="Send USD internationally" onClick={() => setActiveView('WIRE_TRANSFER')} />
                         <ActionRow icon={<ShieldCheck />} title="Compliance Reports" desc="Download monthly statement" />
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeView === 'FX_DESK' && (
             <div className="max-w-3xl mx-auto animate-slide-in">
                <button onClick={() => setActiveView('TREASURY')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold mb-6">
                   <ChevronRight className="rotate-180" size={16} /> Back to Dashboard
                </button>
                
                <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                   <div className="p-8 border-b border-slate-800 bg-slate-950">
                      <h2 className="text-2xl font-bold text-white">FX Liquidity Desk</h2>
                      <p className="text-slate-400 text-sm mt-1">Institutional-grade execution for NGN/USDC pairs.</p>
                   </div>
                   
                   <div className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold">Current Rate</p>
                            <p className="text-xl font-bold text-white">₦{NGN_USD_RATE.toLocaleString()}<span className="text-sm text-slate-500">/USDC</span></p>
                         </div>
                         <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                            <p className="text-xs text-slate-500 uppercase font-bold">Markup Included</p>
                            <p className="text-xl font-bold text-emerald-400">{(fxMarkup * 100).toFixed(2)}%</p>
                         </div>
                      </div>

                      <div className="relative">
                         <div className="absolute left-4 top-3 pointer-events-none">
                            <span className="text-xs font-bold text-slate-500 uppercase">Sell (NGN)</span>
                         </div>
                         <input 
                           type="number" 
                           value={fxAmount}
                           onChange={(e) => setFxAmount(e.target.value)}
                           className="w-full bg-slate-800 border border-slate-600 rounded-xl pt-8 pb-4 px-4 text-2xl font-bold text-white outline-none focus:border-cyan-500"
                           placeholder="0.00"
                         />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="font-bold text-slate-500">NGN</span>
                         </div>
                      </div>

                      <div className="flex justify-center -my-3 z-10 relative">
                         <div className="bg-slate-700 p-2 rounded-full border-4 border-slate-900"><ArrowRightLeft size={20} className="text-slate-300" /></div>
                      </div>

                      <div className="relative">
                         <div className="absolute left-4 top-3 pointer-events-none">
                            <span className="text-xs font-bold text-slate-500 uppercase">Buy (USDC)</span>
                         </div>
                         {/* Logic adjustment: Incorporate markup here purely for display, though Trade logic handles actual fee */}
                         <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pt-8 pb-4 px-4 text-2xl font-bold text-cyan-400">
                            {fxAmount ? (Number(fxAmount) / NGN_USD_RATE * (1 - fxMarkup)).toFixed(2) : '0.00'}
                         </div>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="font-bold text-slate-500">USDC</span>
                         </div>
                      </div>

                      <button 
                        onClick={handleFxConversion}
                        disabled={!fxAmount}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                      >
                         Execute Conversion
                      </button>
                      
                      <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1">
                         <ShieldCheck size={12} /> Guaranteed settlement. No slippage on orders under $100k.
                      </p>
                   </div>
                </div>
             </div>
          )}

          {activeView === 'WIRE_TRANSFER' && (
             <div className="max-w-3xl mx-auto animate-slide-in">
                <button onClick={() => setActiveView('TREASURY')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold mb-6">
                   <ChevronRight className="rotate-180" size={16} /> Back to Dashboard
                </button>

                <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                   <div className="p-8 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                      <div>
                         <h2 className="text-2xl font-bold text-white">Global Wire Transfer</h2>
                         <p className="text-slate-400 text-sm mt-1">Send USD directly to bank accounts worldwide (SWIFT/SEPA).</p>
                      </div>
                      <Globe size={32} className="text-cyan-500" />
                   </div>

                   <div className="p-8">
                      {wireStep === 1 && (
                         <div className="space-y-6">
                            <div>
                               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Beneficiary Details</label>
                               <div className="grid grid-cols-2 gap-4">
                                  <input type="text" placeholder="Account Name" className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-white outline-none" onChange={e => setBeneficiary({...beneficiary, name: e.target.value})} />
                                  <input type="text" placeholder="Bank Name" className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-white outline-none" onChange={e => setBeneficiary({...beneficiary, bank: e.target.value})} />
                                  <input type="text" placeholder="Account / IBAN Number" className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-white outline-none" onChange={e => setBeneficiary({...beneficiary, account: e.target.value})} />
                                  <input type="text" placeholder="SWIFT / BIC Code" className="bg-slate-800 border border-slate-600 rounded-xl p-3 text-white outline-none" onChange={e => setBeneficiary({...beneficiary, swift: e.target.value})} />
                               </div>
                            </div>

                            <div>
                               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Amount (USDC)</label>
                               <div className="flex gap-4 items-center">
                                  <input 
                                    type="number" 
                                    value={wireAmount}
                                    onChange={(e) => setWireAmount(e.target.value)}
                                    placeholder="5000.00"
                                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl p-4 text-xl font-bold text-white outline-none" 
                                  />
                                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
                                     <p className="text-xs text-slate-500 uppercase font-bold">Fee</p>
                                     <p className="text-white font-bold">${wireFee.toFixed(2)}</p>
                                  </div>
                               </div>
                            </div>

                            <button onClick={handleWireTransfer} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2">
                               <Send size={18} /> Initiate Wire Transfer
                            </button>
                         </div>
                      )}

                      {wireStep === 2 && (
                         <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-white">Processing Request</h3>
                            <p className="text-slate-400">Verifying liquidity and routing via intermediary bank...</p>
                         </div>
                      )}

                      {wireStep === 3 && (
                         <div className="py-12 flex flex-col items-center text-center animate-fade-in">
                            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                               <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Transfer Initiated</h3>
                            <p className="text-slate-400 max-w-md mx-auto mt-2 mb-8">
                               Your wire transfer of <strong>${Number(wireAmount).toLocaleString()}</strong> to <strong>{beneficiary.name}</strong> has been submitted. Funds typically arrive within 1-3 business days.
                            </p>
                            <button onClick={() => { setWireStep(1); setWireAmount(''); }} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">
                               Make Another Transfer
                            </button>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {activeView === 'HISTORY' && (
             <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                         <tr>
                            <th className="p-4">Type</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                         <tr className="hover:bg-slate-800/50">
                            <td className="p-4"><span className="text-xs font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">FX_CONVERSION</span></td>
                            <td className="p-4 text-slate-300">Bought USDC with NGN</td>
                            <td className="p-4 font-mono text-white">+50,000.00 USDC</td>
                            <td className="p-4"><span className="text-emerald-400 font-bold text-xs">COMPLETED</span></td>
                            <td className="p-4 text-slate-500 text-xs">2 hours ago</td>
                         </tr>
                         <tr className="hover:bg-slate-800/50">
                            <td className="p-4"><span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">WIRE_OUT</span></td>
                            <td className="p-4 text-slate-300">Wire to Supplier: Tech Corp LLC</td>
                            <td className="p-4 font-mono text-white">-12,450.00 USDC</td>
                            <td className="p-4"><span className="text-amber-400 font-bold text-xs">PROCESSING</span></td>
                            <td className="p-4 text-slate-500 text-xs">Yesterday</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
          )}

       </main>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
   <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
   >
      {icon} {label}
   </button>
);

const ActionRow = ({ icon, title, desc, onClick }: any) => (
   <div onClick={onClick} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 cursor-pointer transition-colors group">
      <div className="bg-slate-900 p-2 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">{icon}</div>
      <div>
         <h4 className="font-bold text-white text-sm">{title}</h4>
         <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <div className="ml-auto text-slate-600 group-hover:text-cyan-400"><ChevronRight size={16} /></div>
   </div>
);