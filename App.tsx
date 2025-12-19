
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { LayoutDashboard, Wallet as WalletIcon, Repeat, BrainCircuit, Bell, LogOut, ShieldAlert, Plus, ArrowUpRight, Settings as SettingsIcon, Coins, LifeBuoy, Users, Code, Shield, Eye, EyeOff, Timer } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Trade } from './components/Trade';
import { Wallet } from './components/Wallet';
import { AIChat } from './components/AIChat';
import { Auth } from './components/Auth';
import { KYC } from './components/KYC';
import { Settings } from './components/Settings';
import { PaymentModal } from './components/PaymentModal';
import { CryptoModal } from './components/CryptoModal';
import { Earn } from './components/Earn';
import { P2P } from './components/P2P';
import { DeveloperPortal } from './components/DeveloperPortal';
import { AdminPortal } from './components/AdminPortal';
import { CorporatePortal } from './components/CorporatePortal';
import { LandingPage } from './components/LandingPage';
import { NotificationContainer } from './components/Notification';
import { PinModal } from './components/PinModal';
import { SupportModal } from './components/SupportModal';
import { INITIAL_ASSETS, MOCK_TRANSACTIONS, NGN_USD_RATE, CHART_DATA } from './constants';
import { Asset, TabView, UserProfile, KYCLevel, Transaction, AssetType, AppNotification, MarketDataPoint, P2POrder, SystemFees, ExpressionOfInterest } from './types';

// --- STORAGE KEYS ---
const KEY_USER = 'klastech_user_v1';
const KEY_ASSETS = 'klastech_assets_v1';
const KEY_TXS = 'klastech_txs_v1';
const KEY_VIEW = 'klastech_view_mode';

// --- DEFAULT SYSTEM FEES ---
const DEFAULT_SYSTEM_FEES: SystemFees = {
  retailTradingFee: 0.005, 
  corporateFxMarkup: 0.002, 
  withdrawalFeeFixed: 50, 
  p2pFee: 0.001, 
  wireTransferFeeUsd: 35 
};

export default function App() {
  // --- NAVIGATION STATE ---
  const [appView, setAppView] = useState<'LANDING' | 'AUTH' | 'MAIN'>(() => {
    const saved = localStorage.getItem(KEY_VIEW);
    return (saved as any) || 'LANDING';
  });

  // --- INITIALIZATION ---
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(KEY_USER);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed.settings.pin) parsed.settings.pin = '1234';
      if (parsed.settings.privacyMode === undefined) parsed.settings.privacyMode = false;
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [systemFees, setSystemFees] = useState<SystemFees>(DEFAULT_SYSTEM_FEES);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(KEY_ASSETS);
      if (!saved) return INITIAL_ASSETS;
      const parsedAssets: Asset[] = JSON.parse(saved);
      return INITIAL_ASSETS.map(initAsset => {
        const found = parsedAssets.find(p => p.id === initAsset.id);
        if (found) {
          return {
            ...found,
            stakedBalance: found.stakedBalance ?? 0,
            iconUrl: initAsset.iconUrl
          };
        }
        return initAsset;
      });
    } catch (e) {
      return INITIAL_ASSETS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(KEY_TXS);
      return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
    } catch (e) {
       return MOCK_TRANSACTIONS;
    }
  });

  const [activeTab, setActiveTab] = useState<TabView>(TabView.DASHBOARD);
  const [chartData, setChartData] = useState<MarketDataPoint[]>(CHART_DATA);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [cryptoModalType, setCryptoModalType] = useState<'SEND' | 'RECEIVE'>('RECEIVE');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false); 
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem(KEY_VIEW, appView);
  }, [appView]);

  useEffect(() => {
    if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
    else localStorage.removeItem(KEY_USER);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(KEY_ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(KEY_TXS, JSON.stringify(transactions));
  }, [transactions]);

  // --- HELPERS ---
  const addNotification = (type: 'SUCCESS' | 'ERROR' | 'INFO', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem(KEY_USER);
    setUser(null);
    setIsAdminLoggedIn(false);
    setAppView('LANDING');
    addNotification('INFO', 'Logged out safely.');
  }, []);

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    addNotification('INFO', 'Admin session closed.');
  };

  const handleLogin = (email: string, name: string, isCorporate = false, companyDetails?: any, emailVerified = false) => {
    const referralCode = name.substring(0,3).toUpperCase() + Math.floor(Math.random() * 9000 + 1000);
    setUser({
      id: isCorporate ? 'corp_001' : 'usr_123',
      email,
      name,
      kycLevel: isCorporate ? KYCLevel.CORPORATE_VERIFIED : KYCLevel.NONE,
      isLoggedIn: true,
      emailVerified,
      isCorporate,
      organizationName: isCorporate ? name : undefined,
      rcNumber: companyDetails?.rcNumber,
      settings: {
        currency: isCorporate ? 'USD' : 'NGN',
        twoFactorEnabled: isCorporate,
        emailNotifications: true,
        theme: 'dark',
        pin: '1234', 
        privacyMode: false
      },
      bankAccounts: [],
      referralCode,
      referralEarnings: 0,
      joinedDate: new Date().toISOString(),
      status: 'ACTIVE'
    });
    setAppView('MAIN');
    addNotification('SUCCESS', isCorporate ? `Merchant Portal Accessed: ${name}` : `Welcome back, ${name}!`);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setAppView('MAIN');
    addNotification('SUCCESS', 'Admin access granted.');
  };

  const handleEOISubmit = (data: ExpressionOfInterest) => {
     console.debug('EOI Captured:', data);
     addNotification('SUCCESS', 'Expression of Interest submitted for ' + data.companyName);
  };

  const handleEnterRetailApp = () => {
     setAppView('AUTH');
  };

  const requirePin = useCallback((action: () => void) => {
    setPendingAction(() => action);
    setShowPinModal(true);
  }, []);

  const handlePinSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // --- HANDLERS (Same as original) ---
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    addNotification('SUCCESS', 'Profile updated successfully.');
  }

  const handleKYCComplete = () => {
    if (user) {
      setUser({ ...user, kycLevel: KYCLevel.TIER_2 });
      addNotification('SUCCESS', 'Identity verified successfully!');
    }
  };

  const executePayment = (amount: number, type: 'DEPOSIT' | 'WITHDRAW') => {
    let finalAmount = amount;
    if (type === 'WITHDRAW') {
       finalAmount = amount - systemFees.withdrawalFeeFixed;
       if (finalAmount <= 0) {
          addNotification('ERROR', 'Withdrawal amount too low to cover fees.');
          return;
       }
    }
    setAssets(prev => prev.map(a => {
      if (a.id === 'naira') {
        const newBalance = type === 'DEPOSIT' ? a.balance + amount : a.balance - amount;
        return { ...a, balance: Math.max(0, newBalance) };
      }
      return a;
    }));
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: type,
      fromSymbol: type === 'DEPOSIT' ? 'BANK' : 'NGN',
      toSymbol: type === 'DEPOSIT' ? 'NGN' : 'BANK',
      fromAmount: amount,
      toAmount: finalAmount, 
      fee: type === 'WITHDRAW' ? systemFees.withdrawalFeeFixed : 0,
      date: new Date().toISOString(),
      status: 'COMPLETED'
    };
    setTransactions(prev => [newTx, ...prev]);
    addNotification('SUCCESS', `${type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} of ₦${amount.toLocaleString()} successful.`);
  };

  const handleTrade = (type: 'BUY' | 'SELL' | 'SWAP', fromId: string, toId: string, amount: number) => {
    const fromAsset = assets.find(a => a.id === fromId);
    const toAsset = assets.find(a => a.id === toId);
    if (!fromAsset || !toAsset || fromAsset.balance < amount) return;

    requirePin(() => {
        const feeRate = user?.isCorporate ? systemFees.corporateFxMarkup : systemFees.retailTradingFee;
        let usdValue = fromAsset.type === AssetType.FIAT ? amount / NGN_USD_RATE : amount * fromAsset.priceUsd;
        let outputAmount = toAsset.type === AssetType.FIAT ? usdValue * NGN_USD_RATE : usdValue / toAsset.priceUsd;
        const finalOutput = outputAmount * (1 - feeRate);

        setAssets(prev => prev.map(a => {
          if (a.id === fromId) return { ...a, balance: a.balance - amount };
          if (a.id === toId) return { ...a, balance: a.balance + finalOutput };
          return a;
        }));

        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type,
          fromSymbol: fromAsset.symbol,
          toSymbol: toAsset.symbol,
          fromAmount: amount,
          toAmount: finalOutput,
          date: new Date().toISOString(),
          status: 'COMPLETED',
          fee: outputAmount * feeRate
        };
        setTransactions(prev => [newTx, ...prev]);
        addNotification('SUCCESS', `${type} successful!`);
    });
  };

  const openPayment = (type: 'DEPOSIT' | 'WITHDRAW') => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  const openCryptoModal = (type: 'SEND' | 'RECEIVE', assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setSelectedAsset(asset);
      setCryptoModalType(type);
      setShowCryptoModal(true);
    }
  };

  const handleCryptoSend = (amount: number, address: string) => {
    if (!selectedAsset) return;
    requirePin(() => {
        setAssets(prev => prev.map(a => {
          if (a.id === selectedAsset.id) return { ...a, balance: a.balance - amount };
          return a;
        }));
        setTransactions(prev => [{
          id: `tx_${Date.now()}`,
          type: 'WITHDRAW',
          fromSymbol: selectedAsset.symbol,
          toSymbol: address.substring(0, 6) + '...',
          fromAmount: amount,
          toAmount: amount,
          date: new Date().toISOString(),
          status: 'COMPLETED'
        }, ...prev]);
        addNotification('SUCCESS', `Sent ${amount} ${selectedAsset.symbol}.`);
    });
  };

  // --- ROUTING ---
  
  if (appView === 'LANDING') {
     return <LandingPage onEnterRetailApp={handleEnterRetailApp} onSubmitEOI={handleEOISubmit} />;
  }

  if (isAdminLoggedIn) {
     return (
       <>
         <NotificationContainer notifications={notifications} onClose={removeNotification} />
         <AdminPortal 
            onLogout={handleAdminLogout} 
            currentUser={user}
            systemFees={systemFees}
            onUpdateFees={setSystemFees}
          />
       </>
     )
  }

  if (!user || !user.isLoggedIn || appView === 'AUTH') {
    return (
      <>
        <NotificationContainer notifications={notifications} onClose={removeNotification} />
        <Auth onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      </>
    );
  }

  if (user.isCorporate) {
     return (
        <>
           <NotificationContainer notifications={notifications} onClose={removeNotification} />
           <PinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} onSuccess={handlePinSuccess} expectedPin={user.settings.pin} />
           <PaymentModal isOpen={showPaymentModal} type={paymentType} savedBanks={user.bankAccounts} onClose={() => setShowPaymentModal(false)} onSuccess={(a) => executePayment(a, paymentType)} />
           <CryptoModal isOpen={showCryptoModal} type={cryptoModalType} asset={selectedAsset} onClose={() => setShowCryptoModal(false)} onSend={handleCryptoSend} />
           <CorporatePortal 
              user={user} assets={assets} onLogout={handleLogout} onTrade={handleTrade}
              onDeposit={() => openPayment('DEPOSIT')} onWithdraw={() => openPayment('WITHDRAW')}
              onSendCrypto={(id) => openCryptoModal('SEND', id)} fxMarkup={systemFees.corporateFxMarkup} wireFee={systemFees.wireTransferFeeUsd}
           />
        </>
     )
  }

  if (user.kycLevel === KYCLevel.NONE) {
    return (
      <>
        <NotificationContainer notifications={notifications} onClose={removeNotification} />
        <KYC onComplete={handleKYCComplete} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-50 overflow-hidden font-inter">
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
      <PinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} onSuccess={handlePinSuccess} expectedPin={user.settings.pin} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} onSubmit={() => addNotification('SUCCESS', 'Ticket submitted.')} />
      <PaymentModal isOpen={showPaymentModal} type={paymentType} savedBanks={user.bankAccounts} onClose={() => setShowPaymentModal(false)} onSuccess={(a) => executePayment(a, paymentType)} />
      <CryptoModal isOpen={showCryptoModal} type={cryptoModalType} asset={selectedAsset} onClose={() => setShowCryptoModal(false)} onSend={handleCryptoSend} />

      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">K</div>
          <h1 className="text-xl font-bold">Klastech</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton active={activeTab === TabView.DASHBOARD} onClick={() => setActiveTab(TabView.DASHBOARD)} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavButton active={activeTab === TabView.WALLET} onClick={() => setActiveTab(TabView.WALLET)} icon={<WalletIcon size={20} />} label="Wallet" />
          <NavButton active={activeTab === TabView.TRADE} onClick={() => setActiveTab(TabView.TRADE)} icon={<Repeat size={20} />} label="Trade" />
          <NavButton active={activeTab === TabView.P2P} onClick={() => setActiveTab(TabView.P2P)} icon={<Users size={20} />} label="P2P" />
          <NavButton active={activeTab === TabView.AI_ASSISTANT} onClick={() => setActiveTab(TabView.AI_ASSISTANT)} icon={<BrainCircuit size={20} />} label="AI Advisor" />
          <NavButton active={activeTab === TabView.SETTINGS} onClick={() => setActiveTab(TabView.SETTINGS)} icon={<SettingsIcon size={20} />} label="Settings" />
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-900/20 rounded-xl transition-colors font-medium">
             <LogOut size={20} /> Sign Out
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
          <h2 className="text-lg font-semibold capitalize">{activeTab.toLowerCase().replace('_', ' ')}</h2>
          <button className="p-2 text-slate-400 hover:text-white"><Bell size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === TabView.DASHBOARD && <Dashboard assets={assets} chartData={chartData} onDeposit={() => openPayment('DEPOSIT')} isPrivacyMode={user.settings.privacyMode} />}
          {activeTab === TabView.TRADE && <Trade assets={assets} onTrade={handleTrade} feePercentage={systemFees.retailTradingFee} />}
          {activeTab === TabView.WALLET && <Wallet assets={assets} transactions={transactions} onDeposit={() => openPayment('DEPOSIT')} onSendCrypto={(id) => openCryptoModal('SEND', id)} onReceiveCrypto={(id) => openCryptoModal('RECEIVE', id)} isPrivacyMode={user.settings.privacyMode} />}
          {activeTab === TabView.P2P && <P2P assets={assets} user={user} onOrderComplete={() => {}} onOrderCreate={() => {}} onOrderCancel={() => {}} />}
          {activeTab === TabView.AI_ASSISTANT && <AIChat assets={assets} />}
          {activeTab === TabView.SETTINGS && <Settings user={user} onUpdateUser={handleUpdateUser} />}
        </div>
      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} <span className="font-medium text-sm">{label}</span>
  </button>
);
