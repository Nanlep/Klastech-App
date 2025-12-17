import React from 'react';
import { X, Share2, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, transaction, onClose }) => {
  if (!isOpen || !transaction) return null;

  const isPositive = ['DEPOSIT', 'BUY', 'UNSTAKE'].includes(transaction.type);
  const statusColor = transaction.status === 'COMPLETED' ? 'text-emerald-500' : transaction.status === 'PENDING' ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
          <h3 className="text-white font-bold">Transaction Receipt</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 bg-slate-50 relative overflow-hidden">
          {/* Jagged Edge Top */}
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-900" style={{clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'}}></div>

          <div className="flex flex-col items-center mb-6 mt-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${transaction.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {transaction.status === 'COMPLETED' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
               {isPositive ? '+' : '-'}{transaction.toAmount > 0 ? transaction.toAmount.toLocaleString() : transaction.fromAmount.toLocaleString()} {transaction.toSymbol || transaction.fromSymbol}
            </h2>
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${transaction.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {transaction.status}
            </span>
          </div>

          <div className="space-y-4 border-t border-dashed border-slate-300 pt-6">
            <Row label="Transaction Type" value={transaction.type} />
            <Row label="Date" value={new Date(transaction.date).toLocaleString()} />
            <Row label="Reference ID" value={transaction.id.toUpperCase()} valueClass="font-mono text-xs" />
            
            {transaction.type === 'SWAP' && (
               <Row label="Swapped From" value={`${transaction.fromAmount} ${transaction.fromSymbol}`} />
            )}
            
            {transaction.fee && transaction.fee > 0 && (
              <Row label="Transaction Fee" value={`${transaction.fee.toFixed(5)}`} />
            )}
          </div>

          {/* Barcode Mock */}
          <div className="mt-8 flex flex-col items-center opacity-50">
             <div className="h-12 w-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/UPC-A-036000291452.svg/1200px-UPC-A-036000291452.svg.png')] bg-cover bg-center grayscale"></div>
             <p className="text-[10px] text-slate-500 mt-1">Klastech Verified Transaction</p>
          </div>
          
           {/* Jagged Edge Bottom */}
           <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-900" style={{clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'}}></div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 flex gap-3">
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <Share2 size={18} /> Share
          </button>
          <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <Download size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, valueClass = "font-bold text-slate-700" }: { label: string, value: string, valueClass?: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-500">{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);