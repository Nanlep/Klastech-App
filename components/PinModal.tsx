import React, { useState, useEffect } from 'react';
import { Lock, Delete, X } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPin: string; // Dynamic PIN passed from App state
  title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess, expectedPin, title = "Enter Transaction PIN" }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (pin.length === 4) {
      // Validate against the user's PIN
      if (pin === expectedPin) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 300);
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, onSuccess, onClose, expectedPin]);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 w-full max-w-xs rounded-3xl border border-slate-800 shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-indigo-400 mb-3 border border-slate-700">
            <Lock size={20} />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">Please enter your 4-digit security PIN</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i 
                  ? error ? 'bg-rose-500' : 'bg-indigo-500 scale-110' 
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        
        {error && (
           <p className="text-center text-rose-500 text-xs font-bold -mt-6 mb-6 animate-pulse">Incorrect PIN. Please try again.</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl transition-colors border border-slate-700 active:scale-95"
            >
              {num}
            </button>
          ))}
          <div className="h-14"></div>
          <button
            onClick={() => handleNumClick('0')}
            className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl transition-colors border border-slate-700 active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};