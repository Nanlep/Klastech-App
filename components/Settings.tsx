
import React, { useState } from 'react';
import { User, Shield, Bell, Globe, Save, CheckCircle2, Lock, Landmark, Plus, Trash2, CreditCard, ChevronRight, Eye, EyeOff, Smartphone, Laptop, LogOut, Clock, Activity, AlertTriangle, ShieldCheck, QrCode, Key, Copy, ArrowRight } from 'lucide-react';
import { UserProfile, BankAccount, SessionActivity } from '../types';
import { MOCK_SESSION_LOGS } from '../constants';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    twoFactor: user.settings.twoFactorEnabled,
    notifications: user.settings.emailNotifications,
    privacyMode: user.settings.privacyMode
  });
  
  // Bank State
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountName: '' });

  // PIN Change State
  const [showPinChange, setShowPinChange] = useState(false);
  const [pinData, setPinData] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [pinError, setPinError] = useState('');

  // 2FA Setup State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorStep, setTwoFactorStep] = useState(1);
  const [secretKey] = useState('JBSWY3DPEHPK3PXP'); // Mock Secret Key

  // Security Center State (SOC 2)
  const [sessions, setSessions] = useState<SessionActivity[]>(MOCK_SESSION_LOGS);

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onUpdateUser({
        ...user,
        name: formData.name,
        settings: {
          ...user.settings,
          twoFactorEnabled: formData.twoFactor,
          emailNotifications: formData.notifications,
          privacyMode: formData.privacyMode
        }
      });
      setIsSaving(false);
      setSuccessMsg('Settings saved successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  const handleAddBank = () => {
    if(!newBank.accountNumber || !newBank.bankName) return;
    
    const bankAccount: BankAccount = {
      id: `ba_${Date.now()}`,
      bankName: newBank.bankName,
      accountNumber: newBank.accountNumber,
      accountName: newBank.accountName || user.name // Default to user name if empty
    };

    onUpdateUser({
      ...user,
      bankAccounts: [...(user.bankAccounts || []), bankAccount]
    });
    
    setShowAddBank(false);
    setNewBank({ bankName: '', accountNumber: '', accountName: '' });
  };

  const handleRemoveBank = (id: string) => {
    onUpdateUser({
      ...user,
      bankAccounts: user.bankAccounts.filter(b => b.id !== id)
    });
  };

  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleChangePin = () => {
    if (!pinData.oldPin || !pinData.newPin || !pinData.confirmPin) {
       setPinError('All fields are required');
       return;
    }
    if (pinData.oldPin !== user.settings.pin) {
       setPinError('Incorrect current PIN');
       return;
    }
    if (pinData.newPin !== pinData.confirmPin) {
       setPinError('New PINs do not match');
       return;
    }
    if (pinData.newPin.length !== 4 || isNaN(Number(pinData.newPin))) {
       setPinError('PIN must be 4 digits');
       return;
    }

    onUpdateUser({
      ...user,
      settings: { ...user.settings, pin: pinData.newPin }
    });
    setShowPinChange(false);
    setPinData({ oldPin: '', newPin: '', confirmPin: '' });
    setPinError('');
    setSuccessMsg('Security PIN updated successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleVerify2FA = () => {
    if (twoFactorCode.length === 6) {
       // Mock Verification
       setTwoFactorStep(2); // Success state
       setTimeout(() => {
          setFormData({ ...formData, twoFactor: true });
          onUpdateUser({
            ...user,
            settings: { ...user.settings, twoFactorEnabled: true }
          });
          setShow2FASetup(false);
          setTwoFactorCode('');
          setTwoFactorStep(1);
          setSuccessMsg('2FA Authenticator enabled successfully');
       }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6 pb-20">
      
      {/* 2FA SETUP MODAL */}
      {show2FASetup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
           <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                 <h3 className="font-bold text-white">Setup Authenticator</h3>
                 <button onClick={() => setShow2FASetup(false)} className="text-slate-400 hover:text-white"><Trash2 size={20} /></button>
              </div>
              <div className="p-6">
                 {twoFactorStep === 1 ? (
                    <div className="space-y-6">
                       <div className="flex flex-col items-center">
                          <div className="bg-white p-4 rounded-xl mb-4">
                             <QrCode size={120} className="text-slate-900" />
                          </div>
                          <p className="text-sm text-slate-400 text-center mb-4">Scan this QR code with your Google Authenticator app.</p>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3 w-full">
                             <div className="p-2 bg-slate-800 rounded-lg text-indigo-400"><Key size={16} /></div>
                             <code className="text-emerald-400 font-mono text-sm flex-1">{secretKey}</code>
                             <button onClick={() => navigator.clipboard.writeText(secretKey)} className="text-slate-500 hover:text-white"><Copy size={16} /></button>
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Verify Code</label>
                          <div className="flex gap-2">
                             <input 
                               type="text" 
                               value={twoFactorCode}
                               onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                               placeholder="123456"
                               className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-center font-mono text-lg tracking-widest outline-none focus:border-indigo-500"
                             />
                             <button 
                               onClick={handleVerify2FA}
                               disabled={twoFactorCode.length !== 6}
                               className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 rounded-xl font-bold flex items-center gap-2"
                             >
                                Verify
                             </button>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                       <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 size={32} />
                       </div>
                       <h3 className="text-xl font-bold text-white">2FA Enabled!</h3>
                       <p className="text-slate-500 text-sm mt-2">Your account is now more secure.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Account Settings</h2>
          <p className="text-slate-400 text-sm">Manage your profile, compliance, and security preferences</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
           <ShieldCheck size={14} className="text-emerald-400" />
           <span className="text-[10px] text-slate-300 font-bold uppercase">ISO 27001 Certified Architecture</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-3">
          <User className="text-indigo-400" size={20} />
          <h3 className="font-bold text-white">Profile Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                readOnly
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 w-fit">
               <CheckCircle2 size={12} />
               KYC Verified (Tier 2)
             </div>
             
             {/* REFERRAL */}
             <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Referral Code</p>
                <p className="text-white font-mono font-bold">{user.referralCode || 'N/A'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Security Center (SOC 2 / ISO 27001) */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-3">
          <Shield className="text-indigo-400" size={20} />
          <h3 className="font-bold text-white">Security Center</h3>
        </div>
        <div className="p-6 space-y-6">
          
          {/* Privacy Toggle (PCI-DSS/Privacy) */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-white flex items-center gap-2">
                 {formData.privacyMode ? <EyeOff size={16} className="text-indigo-400" /> : <Eye size={16} className="text-slate-400" />}
                 Privacy Mode
              </p>
              <p className="text-sm text-slate-400">Mask all balances and sensitive numbers to prevent visual data leaks.</p>
            </div>
            <button 
              onClick={() => setFormData({...formData, privacyMode: !formData.privacyMode})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.privacyMode ? 'bg-indigo-600' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.privacyMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="h-px bg-slate-700 w-full"></div>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium text-white flex items-center gap-2">
                 <Smartphone size={16} className={formData.twoFactor ? 'text-emerald-400' : 'text-slate-400'} />
                 Google Authenticator (2FA)
              </p>
              <p className="text-sm text-slate-400">Require an authenticator code when logging in.</p>
            </div>
            {formData.twoFactor ? (
               <button 
                 onClick={() => { setFormData({...formData, twoFactor: false}); }}
                 className="text-xs text-rose-400 font-bold hover:underline"
               >
                  Disable
               </button>
            ) : (
               <button 
                  onClick={() => setShow2FASetup(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold"
               >
                  Enable 2FA
               </button>
            )}
          </div>

          <div className="h-px bg-slate-700 w-full"></div>

          {/* PIN Change */}
          <div>
             {!showPinChange ? (
                <button 
                  onClick={() => setShowPinChange(true)}
                  className="w-full flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                     <Lock className="text-slate-400 group-hover:text-indigo-400 transition-colors" size={20} />
                     <span className="text-white font-bold text-sm">Change Transaction PIN</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </button>
             ) : (
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 space-y-4 animate-fade-in">
                   <h4 className="text-sm font-bold text-white">Update PIN Code</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="password" maxLength={4} placeholder="Current PIN" value={pinData.oldPin} onChange={(e) => setPinData({...pinData, oldPin: e.target.value.replace(/\D/g, '')})} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-center tracking-widest" />
                      <input type="password" maxLength={4} placeholder="New PIN" value={pinData.newPin} onChange={(e) => setPinData({...pinData, newPin: e.target.value.replace(/\D/g, '')})} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-center tracking-widest" />
                      <input type="password" maxLength={4} placeholder="Confirm" value={pinData.confirmPin} onChange={(e) => setPinData({...pinData, confirmPin: e.target.value.replace(/\D/g, '')})} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 text-center tracking-widest" />
                   </div>
                   {pinError && <p className="text-xs text-rose-500 font-medium">{pinError}</p>}
                   <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => { setShowPinChange(false); setPinError(''); setPinData({oldPin:'',newPin:'',confirmPin:''}) }} className="text-xs font-bold text-slate-500 hover:text-white px-3 py-2">Cancel</button>
                      <button onClick={handleChangePin} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg">Update PIN</button>
                   </div>
                </div>
             )}
          </div>

          <div className="h-px bg-slate-700 w-full"></div>

          {/* Active Sessions (SOC 2 Requirement: Audit Logs) */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
               <Activity size={16} className="text-slate-400" /> Active Sessions
            </h4>
            <div className="space-y-3">
               {sessions.map(session => (
                  <div key={session.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/30 border border-slate-700/50">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                           {session.device.toLowerCase().includes('phone') ? <Smartphone size={18} /> : <Laptop size={18} />}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white flex items-center gap-2">
                              {session.device}
                              {session.isCurrent && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">CURRENT</span>}
                           </p>
                           <p className="text-xs text-slate-500">{session.location} • IP: {formData.privacyMode ? '***.***.***.**' : session.ip}</p>
                           <p className="text-[10px] text-slate-600 mt-0.5"><Clock size={10} className="inline mr-1" /> Last active: {session.lastActive}</p>
                        </div>
                     </div>
                     {!session.isCurrent && (
                        <button 
                           onClick={() => handleRevokeSession(session.id)}
                           className="text-xs text-rose-400 hover:bg-rose-900/20 px-3 py-1.5 rounded-lg border border-rose-900/30 transition-colors"
                        >
                           Revoke
                        </button>
                     )}
                  </div>
               ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bank Accounts Section */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="text-emerald-400" size={20} />
            <h3 className="font-bold text-white">Linked Bank Accounts</h3>
          </div>
          <button 
            onClick={() => setShowAddBank(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> Add Bank
          </button>
        </div>
        
        <div className="p-6">
           {showAddBank && (
             <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-600 mb-4 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</label>
                     <select 
                       value={newBank.bankName}
                       onChange={e => setNewBank({...newBank, bankName: e.target.value})}
                       className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none"
                     >
                       <option value="">Select Bank</option>
                       <option value="GTBank">GTBank</option>
                       <option value="Zenith Bank">Zenith Bank</option>
                       <option value="Access Bank">Access Bank</option>
                       <option value="UBA">UBA</option>
                       <option value="Kuda Bank">Kuda Bank</option>
                       <option value="OPay">OPay</option>
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase">Account Number</label>
                     <input 
                        type="text" 
                        maxLength={10}
                        value={newBank.accountNumber}
                        onChange={e => setNewBank({...newBank, accountNumber: e.target.value.replace(/\D/g,'')})}
                        placeholder="0123456789"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none"
                     />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                   <button onClick={() => setShowAddBank(false)} className="text-slate-400 text-xs font-bold px-3 py-1.5 hover:text-white">Cancel</button>
                   <button onClick={handleAddBank} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg">Save Account</button>
                </div>
             </div>
           )}

           <div className="space-y-3">
             {(!user.bankAccounts || user.bankAccounts.length === 0) && !showAddBank && (
                <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">
                   No bank accounts linked. Add one to withdraw funds.
                </div>
             )}
             {user.bankAccounts?.map(bank => (
               <div key={bank.id} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                       <Landmark size={18} />
                    </div>
                    <div>
                       <p className="text-white font-bold text-sm">{bank.bankName}</p>
                       <p className="text-slate-400 text-xs font-mono">
                          {formData.privacyMode ? '****' + bank.accountNumber.slice(-4) : bank.accountNumber} • {bank.accountName}
                       </p>
                    </div>
                 </div>
                 <button onClick={() => handleRemoveBank(bank.id)} className="text-slate-500 hover:text-rose-500 transition-colors p-2">
                    <Trash2 size={16} />
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        {successMsg && (
          <span className="mr-4 text-emerald-400 text-sm flex items-center gap-1 animate-fade-in">
            <CheckCircle2 size={16} /> {successMsg}
          </span>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};
