
import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Copy, Check, QrCode, AlertCircle, Fuel } from 'lucide-react';
import { Asset } from '../types';

interface CryptoModalProps {
  isOpen: boolean;
  type: 'SEND' | 'RECEIVE';
  asset: Asset | null;
  onClose: () => void;
  onSend: (amount: number, address: string) => void;
}

export const CryptoModal: React.FC<CryptoModalProps> = ({ isOpen, type, asset, onClose, onSend }) => {
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('INPUT');
      setAmount('');
      setAddress('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`0x${asset.symbol}123456789...`); // Mock address
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendProcess = () => {
    setError('');
    const amt = Number(amount);
    
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('Invalid amount');
      return;
    }
    if (amt > asset.balance) {
      setError('Insufficient balance');
      return;
    }

    // Address Validation (Mock Regex for standard crypto addresses)
    // 26-62 characters, alphanumeric
    const addressRegex = /^[a-zA-Z0-9]{26,62}$/;
    
    if (!address) {
      setError('Wallet address is required');
      return;
    }
    
    if (!addressRegex.test(address) && !address.startsWith('0x')) {
       setError('Invalid wallet address format');
       return;
    }
    
    // Prevent sending to self (Mock check)
    if (address.includes(asset.symbol) && address.includes('73')) {
       setError('Cannot send to your own wallet');
       return;
    }

    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSend(amt, address);
        onClose();
      }, 2000);
    }, 2000);
  };

  // Mock Network Fee
  const networkFee = 0.0005; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${type === 'SEND' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {type === 'SEND' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
             </div>
             <div>
                <h3 className="text-lg font-bold text-white">
                  {type === 'SEND' ? 'Send Crypto' : 'Receive Crypto'}
                </h3>
                <p className="text-xs text-slate-400">{asset.name} ({asset.symbol})</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px] flex flex-col justify-center">
          
          {step === 'INPUT' && (
            <>
              {type === 'RECEIVE' ? (
                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-white p-4 rounded-xl">
                    <QrCode size={150} className="text-slate-900" />
                  </div>
                  <div className="w-full">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block text-center">Wallet Address</label>
                    <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between gap-2 border border-slate-700">
                      <code className="text-indigo-400 text-sm truncate">0x{asset.symbol}73...89234</code>
                      <button onClick={handleCopy} className="text-slate-400 hover:text-white">
                        {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-4">
                      Only send <strong>{asset.name} ({asset.symbol})</strong> to this address. Sending any other asset may result in permanent loss.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between mb-2">
                       <label className="text-xs font-bold text-slate-400 uppercase">Amount</label>
                       <span className="text-xs text-slate-500">Available: {asset.balance.toFixed(6)} {asset.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace('-', ''))}
                        placeholder="0.00"
                        className="w-full text-3xl font-bold text-white bg-transparent outline-none placeholder-slate-600"
                      />
                      <span className="font-bold text-slate-400">{asset.symbol}</span>
                    </div>
                  </div>

                  {/* Address Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Recipient Address</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value.trim())}
                      placeholder={`Paste ${asset.symbol} address...`}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600 text-sm font-mono"
                    />
                  </div>

                  {/* Fee Info */}
                  <div className="flex justify-between items-center text-xs bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                     <div className="flex items-center gap-2 text-slate-400">
                       <Fuel size={14} /> Network Fee
                     </div>
                     <span className="text-slate-300">{networkFee} {asset.symbol}</span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <button 
                    onClick={handleSendProcess}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    Send {asset.symbol}
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'PROCESSING' && (
             <div className="flex flex-col items-center justify-center space-y-4">
               <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
               <p className="font-bold text-white">Broadcasting Transaction...</p>
               <p className="text-sm text-slate-500">Confirming on blockchain</p>
             </div>
          )}

          {step === 'SUCCESS' && (
             <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
               <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
                 <Check size={40} />
               </div>
               <h3 className="text-2xl font-bold text-white">Sent!</h3>
               <p className="text-slate-400 text-center">
                 You successfully sent <span className="font-bold text-white">{amount} {asset.symbol}</span>
               </p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
