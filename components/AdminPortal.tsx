import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Activity, AlertTriangle, ShieldAlert, LogOut, 
  Search, Lock, Unlock, Eye, Ban, CheckCircle, XCircle, Gavel, 
  CreditCard, ShieldCheck, Building2, User, Settings as SettingsIcon, Save,
  MessageSquare, X, FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserProfile, DisputeCase, SystemFees, KYCLevel } from '../types';
import { MOCK_USERS_DB, MOCK_DISPUTES, CHART_DATA } from '../constants';

interface AdminPortalProps {
  onLogout: () => void;
  currentUser: UserProfile | null;
  systemFees: SystemFees;
  onUpdateFees: (newFees: SystemFees) => void;
  onResolveDispute?: (disputeId: string, winner: 'BUYER' | 'SELLER') => void; // New Prop
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout, currentUser, systemFees, onUpdateFees, onResolveDispute }) => {
  const [view, setView] = useState<'OVERVIEW' | 'USERS' | 'TRANSACTIONS' | 'DISPUTES' | 'FEES' | 'AUDIT'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Combine Mock DB with the active session user for a complete list
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const list = [...MOCK_USERS_DB];
    if (currentUser) {
       // Avoid duplicate if id matches
       if(!list.find(u => u.id === currentUser.id)) {
         list.unshift({ ...currentUser, status: 'ACTIVE', joinedDate: new Date().toISOString() });
       }
    }
    return list;
  });

  // Local state for Fee Editing
  const [feeConfig, setFeeConfig] = useState<SystemFees>(systemFees);
  const [isSavingFees, setIsSavingFees] = useState(false);

  const [disputes, setDisputes] = useState<DisputeCase[]>(MOCK_DISPUTES);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);

  // Handlers
  const toggleUserStatus = (id: string) => {
    const updatedUsers = allUsers.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE' } as UserProfile;
      }
      return u;
    });
    setAllUsers(updatedUsers);
    
    // Update selected user if open
    if (selectedUser?.id === id) {
      setSelectedUser(updatedUsers.find(u => u.id === id) || null);
    }
  };

  const resolveDispute = (id: string, winner: 'BUYER' | 'SELLER') => {
    if (confirm(`Are you sure you want to resolve this in favor of the ${winner}? This action is irreversible.`)) {
       // Update Local State
       setDisputes(prev => prev.map(d => {
         if (d.id === id) {
           return { ...d, status: winner === 'BUYER' ? 'RESOLVED_BUYER' : 'RESOLVED_SELLER' };
         }
         return d;
       }));
       
       // Trigger Parent Handler for Side Effects (Notifications/Logs)
       if (onResolveDispute) {
         onResolveDispute(id, winner);
       }
       
       setSelectedDispute(null);
    }
  };

  const handleSaveFees = () => {
     setIsSavingFees(true);
     setTimeout(() => {
        onUpdateFees(feeConfig);
        setIsSavingFees(false);
        alert('System fees configuration updated successfully.');
     }, 1000);
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.organizationName && u.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const retailUsersCount = allUsers.filter(u => !u.isCorporate).length;
  const corporateUsersCount = allUsers.filter(u => u.isCorporate).length;

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 font-inter overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-2 mb-1">
             <div className="bg-rose-600 text-white p-1.5 rounded-lg font-bold text-lg shadow-lg shadow-rose-900/50">KA</div>
             <span className="font-bold text-xl tracking-tight">Klastech Admin</span>
           </div>
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Super User Access</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <MenuButton active={view === 'OVERVIEW'} onClick={() => setView('OVERVIEW')} icon={<LayoutDashboard size={18} />} label="Overview" />
          <MenuButton active={view === 'USERS'} onClick={() => setView('USERS')} icon={<Users size={18} />} label="User Management" />
          <MenuButton active={view === 'TRANSACTIONS'} onClick={() => setView('TRANSACTIONS')} icon={<Activity size={18} />} label="Global Transactions" />
          <MenuButton active={view === 'DISPUTES'} onClick={() => setView('DISPUTES')} icon={<Gavel size={18} />} label="P2P Disputes" count={disputes.filter(d => d.status === 'OPEN').length} />
          <MenuButton active={view === 'FEES'} onClick={() => setView('FEES')} icon={<SettingsIcon size={18} />} label="Fees & Pricing" />
          <MenuButton active={view === 'AUDIT'} onClick={() => setView('AUDIT')} icon={<ShieldAlert size={18} />} label="Audit Logs" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-xl mb-3 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center font-bold">A</div>
             <div>
                <p className="text-sm font-bold">Admin User</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-rose-400 hover:text-white px-4 py-2 rounded-lg hover:bg-rose-900/20 transition-colors text-sm font-bold">
             <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0b1120] relative">
        
        {view === 'OVERVIEW' && (
           <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <StatCard title="Total Users" value={allUsers.length.toString()} change={`${corporateUsersCount} Corporate, ${retailUsersCount} Retail`} icon={<Users className="text-indigo-400" />} />
                 <StatCard title="Total Volume (24h)" value="₦45.2M" change="+5.4%" icon={<Activity className="text-emerald-400" />} />
                 <StatCard title="Active Disputes" value={disputes.filter(d => d.status === 'OPEN').length.toString()} change="High Priority" icon={<AlertTriangle className="text-amber-400" />} isAlert={disputes.filter(d => d.status === 'OPEN').length > 0} />
                 <StatCard title="Revenue (MTD)" value="₦1.2M" change="Fees & Markups" icon={<CreditCard className="text-cyan-400" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Main Chart */}
                 <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                    <h3 className="font-bold text-white mb-4">Transaction Volume</h3>
                    <div className="h-72">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={CHART_DATA}>
                           <defs>
                             <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                           <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                           <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                           <Area type="monotone" dataKey="value" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Revenue Dist */}
                 <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                    <h3 className="font-bold text-white mb-4">Revenue Sources</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Trading Fees', value: 45000 },
                              { name: 'Corp FX Markup', value: 25000 },
                              { name: 'Withdrawal Fees', value: 12000 },
                              { name: 'P2P Escrow', value: 8000 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#6366f1" />
                            <Cell fill="#06b6d4" />
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Retail Trade</div>
                         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Corp FX</div>
                         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Withdrawals</div>
                         <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> P2P</div>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {view === 'FEES' && (
           <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white">Fees & Pricing Configuration</h2>
              <p className="text-slate-400 text-sm max-w-2xl">
                 Adjust global transaction fees, corporate markups, and service charges. Changes are applied instantly to the application logic.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 {/* Retail Fees */}
                 <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-6 text-indigo-400">
                       <Users size={20} />
                       <h3 className="font-bold text-white">Retail Pricing</h3>
                    </div>
                    
                    <div className="space-y-6">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Trading Fee (%)</label>
                          <div className="relative">
                             <input 
                               type="number" 
                               value={(feeConfig.retailTradingFee * 100).toFixed(2)}
                               onChange={(e) => setFeeConfig({...feeConfig, retailTradingFee: Number(e.target.value) / 100})}
                               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" 
                               step="0.01"
                             />
                             <span className="absolute right-4 top-3.5 text-slate-500 text-sm font-bold">%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Applied to Swap, Buy, and Sell orders for retail users.</p>
                       </div>

                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">P2P Escrow Fee (%)</label>
                          <div className="relative">
                             <input 
                               type="number" 
                               value={(feeConfig.p2pFee * 100).toFixed(2)}
                               onChange={(e) => setFeeConfig({...feeConfig, p2pFee: Number(e.target.value) / 100})}
                               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                               step="0.01" 
                             />
                             <span className="absolute right-4 top-3.5 text-slate-500 text-sm font-bold">%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Charged on P2P Sell orders.</p>
                       </div>
                    </div>
                 </div>

                 {/* Corporate Fees */}
                 <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-6 text-cyan-400">
                       <Building2 size={20} />
                       <h3 className="font-bold text-white">Corporate & Operations</h3>
                    </div>
                    
                    <div className="space-y-6">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">FX Liquidity Markup (%)</label>
                          <div className="relative">
                             <input 
                               type="number" 
                               value={(feeConfig.corporateFxMarkup * 100).toFixed(2)}
                               onChange={(e) => setFeeConfig({...feeConfig, corporateFxMarkup: Number(e.target.value) / 100})}
                               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none" 
                               step="0.01"
                             />
                             <span className="absolute right-4 top-3.5 text-slate-500 text-sm font-bold">%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Spread added to NGN/USDC conversions for merchants.</p>
                       </div>

                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">USD Wire Fee (Fixed)</label>
                          <div className="relative">
                             <span className="absolute left-4 top-3.5 text-slate-500 text-sm font-bold">$</span>
                             <input 
                               type="number" 
                               value={feeConfig.wireTransferFeeUsd}
                               onChange={(e) => setFeeConfig({...feeConfig, wireTransferFeeUsd: Number(e.target.value)})}
                               className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:border-cyan-500 outline-none" 
                             />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Fixed cost per international wire transfer.</p>
                       </div>
                    </div>
                 </div>

                 {/* Global Settings */}
                 <div className="md:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
                    <h3 className="font-bold text-white mb-4">Global Withdrawal Settings</h3>
                    <div className="flex items-center gap-6">
                       <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Fixed Withdrawal Fee (NGN)</label>
                          <div className="relative">
                             <span className="absolute left-4 top-3.5 text-slate-500 text-sm font-bold">₦</span>
                             <input 
                               type="number" 
                               value={feeConfig.withdrawalFeeFixed}
                               onChange={(e) => setFeeConfig({...feeConfig, withdrawalFeeFixed: Number(e.target.value)})}
                               className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:border-emerald-500 outline-none" 
                             />
                          </div>
                       </div>
                       <div className="flex-1">
                           <p className="text-sm text-slate-400 italic mt-6">
                              This fee is applied to all local bank withdrawals regardless of user tier.
                           </p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex justify-end pt-4">
                 <button 
                   onClick={handleSaveFees}
                   disabled={isSavingFees}
                   className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                 >
                    {isSavingFees ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                    Update Configuration
                 </button>
              </div>
           </div>
        )}

        {view === 'USERS' && (
           <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">User Management</h2>
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search name, email, org..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-indigo-500 w-64"
                    />
                 </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                 <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                       <tr>
                          <th className="p-4">Account Type</th>
                          <th className="p-4">User Identity</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">KYC Tier</th>
                          <th className="p-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                             <td className="p-4">
                                {user.isCorporate ? (
                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                      <Building2 size={12} /> CORPORATE
                                   </span>
                                ) : (
                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                      <User size={12} /> RETAIL
                                   </span>
                                )}
                             </td>
                             <td className="p-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                                      {user.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-white font-bold text-sm">{user.organizationName || user.name}</p>
                                      <p className="text-xs text-slate-500">{user.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                   user.status === 'ACTIVE' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                   {user.status}
                                </span>
                             </td>
                             <td className="p-4">
                                <div className="flex items-center gap-1">
                                   {user.kycLevel >= 2 ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
                                   <span className="text-sm text-slate-300">
                                      {user.isCorporate ? 'Merchant Verified' : `Tier ${user.kycLevel}`}
                                   </span>
                                </div>
                             </td>
                             <td className="p-4 text-right">
                                <button 
                                  onClick={() => toggleUserStatus(user.id)}
                                  className={`p-2 rounded-lg transition-colors ${user.status === 'ACTIVE' ? 'text-rose-400 hover:bg-rose-900/20' : 'text-emerald-400 hover:bg-emerald-900/20'}`}
                                >
                                   {user.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                                </button>
                                <button 
                                  onClick={() => setSelectedUser(user)}
                                  className="p-2 text-indigo-400 hover:bg-indigo-900/20 rounded-lg ml-2" 
                                >
                                   <Eye size={18} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {view === 'DISPUTES' && (
           <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-2">P2P Dispute Resolution</h2>
               <div className="grid grid-cols-1 gap-6">
                 {disputes.length === 0 ? (
                    <div className="text-center p-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed text-slate-500">
                       <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500/50" />
                       <p>No active disputes.</p>
                    </div>
                 ) : (
                    disputes.map(dispute => (
                       <div key={dispute.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-6 hover:border-slate-700 transition-colors">
                          <div className="flex-1 space-y-4">
                             <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${dispute.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>{dispute.status}</span>
                                <span className="text-xs text-slate-500 font-mono">{new Date(dispute.timestamp).toLocaleString()}</span>
                             </div>
                             <div>
                                <h3 className="text-lg font-bold text-white">Order #{dispute.orderId.toUpperCase()}</h3>
                                <p className="text-rose-400 text-sm mt-1 font-medium flex items-center gap-2"><AlertTriangle size={14} /> {dispute.reason}</p>
                             </div>
                             <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <div><p className="text-xs text-slate-500 uppercase font-bold">Buyer</p><p className="text-white font-bold">{dispute.buyerName}</p></div>
                                <div><p className="text-xs text-slate-500 uppercase font-bold">Seller</p><p className="text-white font-bold">{dispute.sellerName}</p></div>
                             </div>
                          </div>
                          <div className="w-full md:w-64 flex flex-col justify-center gap-3 border-l border-slate-800 pl-0 md:pl-6">
                             <button onClick={() => setSelectedDispute(dispute)} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm border border-slate-700">
                                View Case Details
                             </button>
                             {dispute.status === 'OPEN' && (
                                <button onClick={() => resolveDispute(dispute.id, 'BUYER')} className="text-xs text-emerald-500 hover:underline font-bold">
                                  Quick Resolve (Buyer)
                                </button>
                             )}
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        )}

        {view === 'AUDIT' && <div className="p-8 text-center text-slate-500">Audit Log Module Active</div>}
        {view === 'TRANSACTIONS' && <div className="p-8 text-center text-slate-500">Global Transactions View</div>}

      </main>

      {/* USER DETAIL SLIDE-OVER */}
      {selectedUser && (
        <div className="absolute inset-y-0 right-0 w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in-right">
           <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                 <h2 className="text-xl font-bold text-white">User Details</h2>
                 <p className="text-xs text-slate-500 font-mono">ID: {selectedUser.id}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Identity Card */}
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-400 border border-slate-700">
                    {selectedUser.name.charAt(0)}
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-white">{selectedUser.organizationName || selectedUser.name}</h3>
                    <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                    {selectedUser.isCorporate && <p className="text-xs text-cyan-400 font-mono mt-1">{selectedUser.rcNumber}</p>}
                 </div>
              </div>
              
              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => toggleUserStatus(selectedUser.id)}
                   className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${selectedUser.status === 'ACTIVE' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}
                 >
                    {selectedUser.status === 'ACTIVE' ? <><Lock size={16} /> Freeze</> : <><Unlock size={16} /> Unfreeze</>}
                 </button>
                 <button className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2">
                    <FileText size={16} /> Logs
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {/* DISPUTE RESOLUTION CONSOLE MODAL */}
      {selectedDispute && (
         <div className="fixed inset-0 z-50 bg-[#0b1120] flex flex-col animate-fade-in">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6">
               <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <h2 className="text-lg font-bold text-white">Case #{selectedDispute.orderId.toUpperCase()}</h2>
                  <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-bold uppercase">{selectedDispute.status}</span>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => resolveDispute(selectedDispute.id, 'BUYER')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Favor Buyer</button>
                  <button onClick={() => resolveDispute(selectedDispute.id, 'SELLER')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Favor Seller</button>
               </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
               {/* LEFT: Case Info */}
               <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Transaction Details</h3>
                  <div className="space-y-4 mb-8">
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-500">Fiat Amount</p>
                        <p className="text-xl font-bold text-white">₦{selectedDispute.amountFiat.toLocaleString()}</p>
                     </div>
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-slate-500">Crypto Amount</p>
                        <p className="text-xl font-bold text-emerald-400">{selectedDispute.amountCrypto} {selectedDispute.asset}</p>
                     </div>
                     <div className="p-4 rounded-xl bg-rose-900/10 border border-rose-900/30">
                        <p className="text-xs text-rose-400 font-bold uppercase mb-1">Dispute Reason</p>
                        <p className="text-sm text-white">{selectedDispute.reason}</p>
                     </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Audit Timeline</h3>
                  <div className="relative border-l border-slate-700 ml-2 space-y-6 pb-2">
                     {selectedDispute.timeline?.map((event, i) => (
                        <div key={i} className="pl-6 relative">
                           <div className={`absolute -left-1.5 top-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                              event.status === 'DONE' ? 'bg-emerald-500' : 
                              event.status === 'WARNING' ? 'bg-rose-500' : 'bg-slate-500'
                           }`}></div>
                           <p className="text-sm font-bold text-white leading-none">{event.title}</p>
                           <p className="text-xs text-slate-500 mt-1 font-mono">{event.time}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* MIDDLE: Chat Transcript */}
               <div className="flex-1 bg-[#0b1120] flex flex-col border-r border-slate-800">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                     <h3 className="font-bold text-white flex items-center gap-2"><MessageSquare size={16} /> Chat Transcript</h3>
                     <span className="text-xs text-slate-500">Forensic View (Read-Only)</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                     {selectedDispute.chatTranscript?.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'SYSTEM' ? 'justify-center' : msg.sender === 'BUYER' ? 'justify-start' : 'justify-end'}`}>
                           {msg.sender === 'SYSTEM' ? (
                              <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{msg.text}</span>
                           ) : (
                              <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                                 msg.sender === 'BUYER' ? 'bg-indigo-900/40 text-indigo-100 rounded-tl-none border border-indigo-500/20' : 
                                 'bg-emerald-900/40 text-emerald-100 rounded-tr-none border border-emerald-500/20'
                              }`}>
                                 <p className="text-[10px] font-bold opacity-50 mb-1">{msg.sender} • {msg.timestamp}</p>
                                 <p>{msg.text}</p>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>

               {/* RIGHT: Evidence & Users */}
               <div className="w-96 bg-slate-900 p-6 overflow-y-auto">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Evidence Vault</h3>
                  <div className="grid grid-cols-2 gap-2 mb-8">
                     {selectedDispute.evidenceImages?.map((img, i) => (
                        <div key={i} className="aspect-video bg-slate-800 rounded-lg border border-slate-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                           <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                     ))}
                     {(!selectedDispute.evidenceImages || selectedDispute.evidenceImages.length === 0) && (
                        <div className="col-span-2 py-4 text-center text-xs text-slate-500 italic border border-dashed border-slate-700 rounded-lg">No images uploaded</div>
                     )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Reputation Analysis</h3>
                  <div className="space-y-4">
                     {/* Buyer Card */}
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between mb-2">
                           <span className="text-xs font-bold text-indigo-400">BUYER</span>
                           <span className="text-xs text-white font-bold">{selectedDispute.buyerName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                           <div className="bg-slate-900 p-2 rounded">
                              <span className="block text-slate-500">Orders</span>
                              <span className="block text-white font-mono">{selectedDispute.buyerStats?.totalOrders}</span>
                           </div>
                           <div className="bg-slate-900 p-2 rounded">
                              <span className="block text-slate-500">Completion</span>
                              <span className={`block font-mono ${selectedDispute.buyerStats?.completionRate > 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {selectedDispute.buyerStats?.completionRate}%
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Seller Card */}
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between mb-2">
                           <span className="text-xs font-bold text-emerald-400">SELLER</span>
                           <span className="text-xs text-white font-bold">{selectedDispute.sellerName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                           <div className="bg-slate-900 p-2 rounded">
                              <span className="block text-slate-500">Orders</span>
                              <span className="block text-white font-mono">{selectedDispute.sellerStats?.totalOrders}</span>
                           </div>
                           <div className="bg-slate-900 p-2 rounded">
                              <span className="block text-slate-500">Completion</span>
                              <span className={`block font-mono ${selectedDispute.sellerStats?.completionRate > 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {selectedDispute.sellerStats?.completionRate}%
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

const MenuButton = ({ active, onClick, icon, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
       active ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="font-medium text-sm flex-1 text-left">{label}</span>
    {count > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
  </button>
);

const StatCard = ({ title, value, change, icon, isAlert }: any) => (
  <div className={`bg-slate-900 p-6 rounded-2xl border shadow-lg ${isAlert ? 'border-rose-500/50 bg-rose-900/10' : 'border-slate-800'}`}>
     <div className="flex justify-between items-start mb-2">
        <span className="text-slate-500 text-xs font-bold uppercase">{title}</span>
        {icon}
     </div>
     <div>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className={`text-xs font-bold mt-1 ${isAlert ? 'text-rose-400' : 'text-emerald-400'}`}>{change}</p>
     </div>
  </div>
);