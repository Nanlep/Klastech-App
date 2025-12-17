import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubject('');
      setMessage('');
      onSubmit();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <MessageSquare size={20} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-white">Help & Support</h3>
               <p className="text-xs text-slate-400">We typically reply within 1 hour.</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Subject</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">Select an issue...</option>
              <option value="Transaction Issue">Transaction Issue</option>
              <option value="Account Verification">Account Verification (KYC)</option>
              <option value="Deposit/Withdrawal">Deposit/Withdrawal</option>
              <option value="Security">Security Concern</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">Message</label>
             <textarea 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Describe your issue in detail..."
               className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-32 resize-none"
               required
             />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Send size={18} /> Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};