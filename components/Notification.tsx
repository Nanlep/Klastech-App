import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationContainerProps {
  notifications: AppNotification[];
  onClose: (id: string) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 pointer-events-none">
      {notifications.map((note) => (
        <Toast key={note.id} note={note} onClose={onClose} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ note: AppNotification; onClose: (id: string) => void }> = ({ note, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(note.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [note.id, onClose]);

  const bgColors = {
    SUCCESS: 'bg-emerald-900/90 border-emerald-500',
    ERROR: 'bg-rose-900/90 border-rose-500',
    INFO: 'bg-indigo-900/90 border-indigo-500',
  };

  const icons = {
    SUCCESS: <CheckCircle className="text-emerald-400" size={20} />,
    ERROR: <XCircle className="text-rose-400" size={20} />,
    INFO: <Info className="text-indigo-400" size={20} />,
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md min-w-[320px] max-w-sm animate-slide-in ${bgColors[note.type]}`}>
      <div className="mt-0.5">{icons[note.type]}</div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-sm uppercase tracking-wide">{note.type}</h4>
        <p className="text-slate-200 text-sm mt-1">{note.message}</p>
      </div>
      <button onClick={() => onClose(note.id)} className="text-slate-400 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};