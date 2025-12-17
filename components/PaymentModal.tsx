import React, { useState } from 'react';
import { X, CreditCard, Landmark, ArrowRight, CheckCircle2, Lock, Plus, AlertTriangle } from 'lucide-react';
import { BankAccount } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  type: 'DEPOSIT' | 'WITHDRAW';
  savedBanks?: BankAccount[];
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, type, savedBanks = [], onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');

  if (!isOpen) return null;

  const handleProcess = () => {
    if (!amount || isNaN(Number(amount))) return;
    if (type === 'WITHDRAW' && !selectedBankId) return;

    setStep('PROCESSING');
    
    // Simulate Paystack Popup / Processing time
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess(Number(amount));
        setStep('INPUT');
        setAmount('');
        setSelectedBankId('');
        onClose();
      }, 2000);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        {/* Header */}
        <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {type === 'DEPOSIT' ? 'Fund Wallet (NGN)' : 'Withdraw to Bank'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-50 min-h-[300px] flex flex-col justify-center">
          
          {step === 'INPUT' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount (NGN)</label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-slate-400">₦</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full text-3xl font-bold text-slate-900 outline-none placeholder-slate-200"
                  />
                </div>
              </div>

              {type === 'DEPOSIT' ? (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Select Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50 text-indigo-900 transition-colors">
                      <CreditCard size={24} className="mb-2" />
                      <span className="text-sm font-bold">Card</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
                      <Landmark size={24} className="mb-2" />
                      <span className="text-sm font-bold">Transfer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                   <p className="text-xs font-bold text-slate-500 uppercase mb-3">Destination Account</p>
                   {savedBanks.length > 0 ? (
                     <div className="space-y-2">
                       {savedBanks.map(bank => (
                         <button 
                           key={bank.id}
                           onClick={() => setSelectedBankId(bank.id)}
                           className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${selectedBankId === bank.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                         >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${selectedBankId === bank.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Landmark size={18} />
                              </div>
                              <div>
                                <p className={`text-sm font-bold ${selectedBankId === bank.id ? 'text-indigo-900' : 'text-slate-700'}`}>{bank.bankName}</p>
                                <p className="text-xs text-slate-500">{bank.accountNumber}</p>
                              </div>
                            </div>
                            {selectedBankId === bank.id && <CheckCircle2 size={18} className="text-indigo-600" />}
                         </button>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <AlertTriangle size={24} className="text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-700 font-bold">No Bank Accounts Linked</p>
                        <p className="text-xs text-slate-500 mb-3">Go to Settings to add a withdrawal account.</p>
                     </div>
                   )}
                </div>
              )}

              <button 
                onClick={handleProcess}
                disabled={!amount || (type === 'WITHDRAW' && !selectedBankId)}
                className="w-full bg-[#00c3f7] hover:bg-[#00b3e3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                {type === 'DEPOSIT' ? 'Pay with Paystack' : 'Withdraw Funds'}
                <ArrowRight size={20} />
              </button>
              
              <div className="flex justify-center mt-2">
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock size={10} /> Secured by Paystack
                </p>
              </div>
            </div>
          )}

          {step === 'PROCESSING' && (
             <div className="flex flex-col items-center justify-center space-y-4">
               <div className="w-16 h-16 border-4 border-slate-200 border-t-[#00c3f7] rounded-full animate-spin"></div>
               <p className="font-bold text-slate-700">Connecting to Gateway...</p>
               <p className="text-sm text-slate-500">Please wait while we process your request.</p>
             </div>
          )}

          {step === 'SUCCESS' && (
             <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
               <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                 <CheckCircle2 size={40} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
               <p className="text-slate-500 text-center">
                 {type === 'DEPOSIT' 
                   ? `Your deposit of ₦${Number(amount).toLocaleString()} was successful.`
                   : `Withdrawal of ₦${Number(amount).toLocaleString()} initiated.`
                 }
               </p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};