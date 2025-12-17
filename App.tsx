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
import { NotificationContainer } from './components/Notification';
import { PinModal } from './components/PinModal';
import { SupportModal } from './components/SupportModal';
import { INITIAL_ASSETS, MOCK_TRANSACTIONS, NGN_USD_RATE, CHART_DATA } from './constants';
import { Asset, TabView, UserProfile, KYCLevel, Transaction, AssetType, AppNotification, MarketDataPoint, P2POrder, SystemFees } from './types';

// --- STORAGE KEYS ---
const KEY_USER = 'klastech_user_v1';
const KEY_ASSETS = 'klastech_assets_v1';
const KEY_TXS = 'klastech_txs_v1';

// --- DEFAULT SYSTEM FEES ---
const DEFAULT_SYSTEM_FEES: SystemFees = {
  retailTradingFee: 0.005, // 0.5%
  corporateFxMarkup: 0.002, // 0.2%
  withdrawalFeeFixed: 50, // 50 NGN
  p2pFee: 0.001, // 0.1%
  wireTransferFeeUsd: 35 // 35 USD
};

export default function App() {
  // --- INITIALIZATION (With Persistence & Migration) ---
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(KEY_USER);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Migration: Ensure PIN & Privacy exist
      if (!parsed.settings.pin) parsed.settings.pin = '1234';
      if (parsed.settings.privacyMode === undefined) parsed.settings.privacyMode = false;
      return parsed;
    } catch (e) {
      console.error("Failed to load user", e);
      return null;
    }
  });

  // System Fees State (Lifted for Admin Control)
  const [systemFees, setSystemFees] = useState<SystemFees>(DEFAULT_SYSTEM_FEES);

  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem(KEY_ASSETS);
      if (!saved) return INITIAL_ASSETS;
      
      const parsedAssets: Asset[] = JSON.parse(saved);
      
      // MIGRATION: Ensure all assets have new fields (e.g. stakedBalance)
      const mergedAssets = INITIAL_ASSETS.map(initAsset => {
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
      
      return mergedAssets;
    } catch (e) {
      console.error("Failed to load assets", e);
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

  // App State
  const [activeTab, setActiveTab] = useState<TabView>(TabView.DASHBOARD);
  const [chartData, setChartData] = useState<MarketDataPoint[]>(CHART_DATA);
  
  // Modal & Notification State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  
  // Crypto Modal State
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [cryptoModalType, setCryptoModalType] = useState<'SEND' | 'RECEIVE'>('RECEIVE');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Security State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false); // SOC 2: Session Warning

  // Support State
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // --- PERSISTENCE EFFECTS ---
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

  // --- HELPER: NOTIFICATIONS ---
  const addNotification = (type: 'SUCCESS' | 'ERROR' | 'INFO', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- LOGOUT HANDLER (CLEANUP) ---
  const handleLogout = useCallback(() => {
    localStorage.removeItem(KEY_USER);
    setUser(null);
    setIsAdminLoggedIn(false);
    // Close all sensitive modals
    setShowPinModal(false);
    setShowPaymentModal(false);
    setShowCryptoModal(false);
    setShowSupportModal(false);
    setShowSessionWarning(false);
    setPendingAction(null);
    addNotification('INFO', 'Logged out safely.');
  }, []);

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    addNotification('INFO', 'Admin session closed.');
  };

  // --- SESSION IDLE TIMER (SOC 2 Compliant) ---
  useEffect(() => {
     if (!user || !user.isLoggedIn || isAdminLoggedIn) return;

     let timeoutId: any;
     let warningTimeoutId: any;
     const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 Minutes
     const WARNING_TIME = 4 * 60 * 1000; // Warn at 4 minutes

     const resetTimer = () => {
        clearTimeout(timeoutId);
        clearTimeout(warningTimeoutId);
        setShowSessionWarning(false);
        
        warningTimeoutId = setTimeout(() => {
            setShowSessionWarning(true);
        }, WARNING_TIME);

        timeoutId = setTimeout(() => {
           handleLogout();
        }, INACTIVITY_LIMIT);
     };

     // Only attach listeners if warning is not active (to prevent auto-reset if user is idle but modal is open)
     if (!showSessionWarning) {
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('click', resetTimer);
     }
     
     resetTimer(); // Start timer

     return () => {
        clearTimeout(timeoutId);
        clearTimeout(warningTimeoutId);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keypress', resetTimer);
        window.removeEventListener('click', resetTimer);
     };
  }, [user, handleLogout, isAdminLoggedIn, showSessionWarning]);


  // --- HELPER: SECURITY INTERCEPTOR ---
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

  // --- MARKET SIMULATION & ORDER MATCHING ENGINE ---
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      // 1. Simulate Price Movement (±0.2% randomness)
      setAssets(currentAssets => {
        const updatedAssets = currentAssets.map(asset => {
          if (asset.type === AssetType.FIAT) return asset; // Fiat is stable relative to itself in this context
          
          const volatility = 0.002; // 0.2% change
          const direction = Math.random() > 0.45 ? 1 : -1; // Slight upward bias
          const change = 1 + (Math.random() * volatility * direction);
          const newPrice = asset.priceUsd * change;
          
          // Calculate 24h change (Simulated accumulation)
          const newChange24h = asset.change24h + (direction * (Math.random() * 0.1));

          return {
            ...asset,
            priceUsd: newPrice,
            change24h: parseFloat(newChange24h.toFixed(2))
          };
        });

        // 2. CHECK LIMIT ORDERS against new prices
        setTransactions(currentTxs => {
           let hasExecuted = false;
           const newTxs = currentTxs.map(tx => {
             if (tx.status !== 'OPEN' || tx.orderType !== 'LIMIT' || !tx.price) return tx;

             const targetSymbol = tx.toSymbol;
             const fromSymbol = tx.fromSymbol;
             const toAsset = updatedAssets.find(a => a.symbol === targetSymbol);
             const fromAsset = updatedAssets.find(a => a.symbol === fromSymbol);

             if(!toAsset || !fromAsset) return tx;

             // Logic: Limit Price Checks
             const currentPriceNGN = toAsset.priceUsd * NGN_USD_RATE; // Approx NGN Price of target

             let shouldExecute = false;

             if (tx.type === 'BUY') {
                if (currentPriceNGN <= tx.price) shouldExecute = true;
             } else if (tx.type === 'SELL') {
                const sellAssetPriceNGN = fromAsset.priceUsd * NGN_USD_RATE;
                if (sellAssetPriceNGN >= tx.price) shouldExecute = true;
             }

             if (shouldExecute) {
               hasExecuted = true;
               
               let finalReceived = 0;
               // Determine fee based on user type
               const fee = user.isCorporate ? systemFees.corporateFxMarkup : systemFees.retailTradingFee;

               if (tx.type === 'BUY') {
                 // Prevent division by zero checks
                 if(currentPriceNGN > 0) {
                     finalReceived = (tx.fromAmount / currentPriceNGN) * (1 - fee);
                 }
               } else {
                 const executionPrice = fromAsset.priceUsd * NGN_USD_RATE;
                 finalReceived = (tx.fromAmount * executionPrice) * (1 - fee);
               }
               
               if(isNaN(finalReceived) || finalReceived < 0) finalReceived = 0;

               return {
                 ...tx,
                 status: 'COMPLETED' as const,
                 toAmount: finalReceived,
                 fee: finalReceived * fee,
                 date: new Date().toISOString()
               };
             }

             return tx;
           });

           if (hasExecuted) {
               addNotification('SUCCESS', 'Limit Order Executed!');
           }
           return newTxs;
        });

        return updatedAssets;
      });
      
      // 3. Update Chart Data Live
      setChartData(prev => {
        const lastTime = prev[prev.length - 1].time;
        const newVal = 45000 + (Math.random() * 5000);
        const newPoints = [...prev];
        newPoints[newPoints.length - 1] = { ...newPoints[newPoints.length - 1], value: newVal };
        return newPoints;
      });

    }, 3000); // Run every 3 seconds

    return () => clearInterval(intervalId);
  }, [user, systemFees]); // Added systemFees dependency


  // --- HANDLERS ---

  const handleLogin = (email: string, name: string, isCorporate = false, companyDetails?: any, emailVerified = false) => {
    // Generate referral code if new user (simulated)
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
        twoFactorEnabled: isCorporate, // Corporate defaults to 2FA
        emailNotifications: true,
        theme: 'dark',
        pin: '1234', // Default PIN
        privacyMode: false
      },
      bankAccounts: [],
      referralCode,
      referralEarnings: 0,
      joinedDate: new Date().toISOString(),
      status: 'ACTIVE'
    });
    addNotification('SUCCESS', isCorporate ? `Merchant Portal Accessed: ${name}` : `Welcome back, ${name}!`);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    addNotification('SUCCESS', 'Admin access granted.');
  };

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
    
    // Apply Withdrawal Fee
    if (type === 'WITHDRAW') {
       finalAmount = amount - systemFees.withdrawalFeeFixed;
       if (finalAmount <= 0) {
          addNotification('ERROR', 'Withdrawal amount too low to cover fees.');
          return;
       }
    }

    setAssets(prev => prev.map(a => {
      if (a.id === 'naira') {
        const newBalance = type === 'DEPOSIT' ? a.balance + amount : a.balance - amount; // Deduct full requested amount from balance
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
      toAmount: finalAmount, // Logic: For withdrawal, user receives less. For deposit, user receives full (assuming no deposit fee)
      fee: type === 'WITHDRAW' ? systemFees.withdrawalFeeFixed : 0,
      date: new Date().toISOString(),
      status: 'COMPLETED'
    };
    setTransactions(prev => [newTx, ...prev]);
    addNotification('SUCCESS', `${type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} of ₦${amount.toLocaleString()} successful.`);
  };

  const handlePaymentSuccess = (amount: number) => {
    // If Deposit -> Direct execute. If Withdraw -> Require PIN.
    if (paymentType === 'DEPOSIT') {
       executePayment(amount, 'DEPOSIT');
    } else {
       requirePin(() => executePayment(amount, 'WITHDRAW'));
    }
  };

  const openPayment = (type: 'DEPOSIT' | 'WITHDRAW') => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  // --- CRYPTO TRANSFER HANDLERS ---
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
          if (a.id === selectedAsset.id) {
            return { ...a, balance: a.balance - amount };
          }
          return a;
        }));

        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type: 'WITHDRAW', // Crypto Send is classified as Withdraw from wallet
          fromSymbol: selectedAsset.symbol,
          toSymbol: address.substring(0, 6) + '...', // External Address
          fromAmount: amount,
          toAmount: amount,
          date: new Date().toISOString(),
          status: 'COMPLETED'
        };
        setTransactions(prev => [newTx, ...prev]);
        addNotification('SUCCESS', `${amount} ${selectedAsset.symbol} sent successfully.`);
    });
  };

  // --- STAKING HANDLERS ---
  const handleStake = (assetId: string, amount: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || asset.balance < amount) return;

    requirePin(() => {
       setAssets(prev => prev.map(a => {
         if (a.id === assetId) {
           return { ...a, balance: a.balance - amount, stakedBalance: (a.stakedBalance || 0) + amount };
         }
         return a;
       }));

       const newTx: Transaction = {
         id: `stk_${Date.now()}`,
         type: 'STAKE',
         fromSymbol: asset.symbol,
         toSymbol: 'EARN',
         fromAmount: amount,
         toAmount: amount,
         date: new Date().toISOString(),
         status: 'COMPLETED'
       };
       setTransactions(prev => [newTx, ...prev]);
       addNotification('SUCCESS', `Staked ${amount} ${asset.symbol}. Earnings started.`);
    });
  };

  const handleUnstake = (assetId: string, amount: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || (asset.stakedBalance || 0) < amount) return;

    requirePin(() => {
       setAssets(prev => prev.map(a => {
         if (a.id === assetId) {
           return { ...a, balance: a.balance + amount, stakedBalance: (a.stakedBalance || 0) - amount };
         }
         return a;
       }));

       const newTx: Transaction = {
         id: `unstk_${Date.now()}`,
         type: 'UNSTAKE',
         fromSymbol: 'EARN',
         toSymbol: asset.symbol,
         fromAmount: amount,
         toAmount: amount,
         date: new Date().toISOString(),
         status: 'COMPLETED'
       };
       setTransactions(prev => [newTx, ...prev]);
       addNotification('SUCCESS', `Redeemed ${amount} ${asset.symbol} to spot wallet.`);
    });
  };

  const handleTrade = (type: 'BUY' | 'SELL' | 'SWAP', fromId: string, toId: string, amount: number, orderType: 'MARKET' | 'LIMIT' = 'MARKET', limitPrice?: number) => {
    const fromAsset = assets.find(a => a.id === fromId);
    const toAsset = assets.find(a => a.id === toId);

    if (!fromAsset || !toAsset) {
      addNotification('ERROR', 'Asset not found.');
      return;
    }

    if (fromAsset.balance < amount) {
      addNotification('ERROR', `Insufficient ${fromAsset.symbol} balance.`);
      return;
    }

    const tradeAction = () => {
        // LIMIT ORDER
        if (orderType === 'LIMIT') {
          setAssets(prev => prev.map(a => {
            if (a.id === fromId) return { ...a, balance: a.balance - amount }; // Escrow funds
            return a;
          }));

          const newTx: Transaction = {
            id: `ord_${Date.now()}`,
            type: type,
            fromSymbol: fromAsset.symbol,
            toSymbol: toAsset.symbol,
            fromAmount: amount,
            toAmount: 0,
            date: new Date().toISOString(),
            status: 'OPEN',
            orderType: 'LIMIT',
            price: limitPrice
          };
          setTransactions(prev => [newTx, ...prev]);
          addNotification('INFO', 'Limit order placed. Funds reserved.');
          return;
        }

        // MARKET ORDER
        // Determine Fee based on Corporate or Retail
        const feeRate = user?.isCorporate ? systemFees.corporateFxMarkup : systemFees.retailTradingFee;

        let usdValue = 0;
        
        if (fromAsset.type === AssetType.FIAT) {
          usdValue = amount / NGN_USD_RATE;
        } else {
          usdValue = amount * fromAsset.priceUsd;
        }

        let outputAmount = 0;
        if (toAsset.type === AssetType.FIAT) {
          outputAmount = usdValue * NGN_USD_RATE;
        } else {
          outputAmount = usdValue / toAsset.priceUsd;
        }

        const finalOutput = outputAmount * (1 - feeRate);
        const feeAmount = outputAmount * feeRate;

        setAssets(prev => prev.map(a => {
          if (a.id === fromId) return { ...a, balance: a.balance - amount };
          if (a.id === toId) return { ...a, balance: a.balance + finalOutput };
          return a;
        }));

        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type: type === 'BUY' && fromAsset.type === 'FIAT' ? 'FX_CONVERSION' : type,
          fromSymbol: fromAsset.symbol,
          toSymbol: toAsset.symbol,
          fromAmount: amount,
          toAmount: finalOutput,
          date: new Date().toISOString(),
          status: 'COMPLETED',
          orderType: 'MARKET',
          fee: feeAmount
        };

        setTransactions(prev => [newTx, ...prev]);
        addNotification('SUCCESS', `${type} executed! Received ${finalOutput.toFixed(4)} ${toAsset.symbol}`);
    };

    requirePin(tradeAction);
  };

  // --- P2P HANDLERS ---
  const handleP2POrderCreate = (order: P2POrder) => {
    // Check if ID already exists in transactions to prevent duplicates
    if(transactions.some(t => t.id === `${order.id}_lock`)) return;

    if (order.type === 'SELL') {
      requirePin(() => {
         setAssets(prev => prev.map(a => {
           if (a.symbol === order.assetSymbol) {
              return { ...a, balance: a.balance - order.cryptoAmount };
           }
           return a;
         }));

         const newTx: Transaction = {
           id: `${order.id}_lock`,
           type: 'P2P_LOCK',
           fromSymbol: order.assetSymbol,
           toSymbol: 'ESCROW',
           fromAmount: order.cryptoAmount,
           toAmount: order.cryptoAmount,
           date: new Date().toISOString(),
           status: 'COMPLETED'
        };
         setTransactions(prev => [newTx, ...prev]);
         addNotification('INFO', `Escrow Locked: ${order.cryptoAmount} ${order.assetSymbol} reserved.`);
      });
    } else {
       addNotification('SUCCESS', 'P2P Order Created. Please proceed to payment.');
    }
  };

  const handleP2POrderCancel = (order: P2POrder) => {
     if (order.type === 'SELL') {
        // Refund Escrow
        setAssets(prev => prev.map(a => {
           if (a.symbol === order.assetSymbol) {
              return { ...a, balance: a.balance + order.cryptoAmount };
           }
           return a;
        }));

        const newTx: Transaction = {
           id: `${order.id}_refund`,
           type: 'P2P_REFUND',
           fromSymbol: 'ESCROW',
           toSymbol: order.assetSymbol,
           fromAmount: order.cryptoAmount,
           toAmount: order.cryptoAmount,
           date: new Date().toISOString(),
           status: 'COMPLETED'
        };
        setTransactions(prev => [newTx, ...prev]);
        addNotification('INFO', 'Order Cancelled. Assets refunded from escrow.');
     } else {
        addNotification('INFO', 'Buy Order Cancelled.');
     }
  };

  const handleP2POrderComplete = (order: P2POrder) => {
    // Only process if order object is valid
    if(!order) return;
    
    requirePin(() => {
       // BUYER COMPLETE: Gets Crypto
       if (order.type === 'BUY') {
         setAssets(prev => prev.map(a => {
            if (a.symbol === order.assetSymbol) {
               return { ...a, balance: a.balance + order.cryptoAmount };
            }
            return a;
         }));
         
         addNotification('SUCCESS', `P2P Order Completed. ${order.cryptoAmount.toFixed(4)} ${order.assetSymbol} released to your wallet.`);

         const newTx: Transaction = {
            id: order.id,
            type: 'P2P_BUY',
            fromSymbol: 'NGN',
            toSymbol: order.assetSymbol,
            fromAmount: order.fiatAmount,
            toAmount: order.cryptoAmount,
            date: new Date().toISOString(),
            status: 'COMPLETED'
         };
         setTransactions(prev => [newTx, ...prev]);

       } else {
         // SELLER COMPLETE: Crypto was already locked. Just record success.
         addNotification('SUCCESS', `P2P Sold. ${order.cryptoAmount.toFixed(4)} ${order.assetSymbol} released to buyer.`);

         const newTx: Transaction = {
            id: order.id,
            type: 'P2P_SELL',
            fromSymbol: order.assetSymbol,
            toSymbol: 'NGN',
            fromAmount: order.cryptoAmount,
            toAmount: order.fiatAmount,
            date: new Date().toISOString(),
            status: 'COMPLETED'
         };
         setTransactions(prev => [newTx, ...prev]);
       }
    });
  };

  const handleDisputeResolution = (disputeId: string, winner: 'BUYER' | 'SELLER') => {
    // In a real app, this would perform actual logic like unlocking escrow to the winner
    // For this simulation, we will notify and log
    const resolutionMsg = winner === 'BUYER' 
      ? `Dispute ${disputeId} resolved: Funds released to Buyer.`
      : `Dispute ${disputeId} resolved: Funds returned to Seller.`;
      
    addNotification('SUCCESS', resolutionMsg);
  };

  const handleSupportSubmit = () => {
     addNotification('SUCCESS', 'Ticket submitted. Ticket ID: #KL-' + Math.floor(Math.random() * 9000));
  };

  // --- RENDER FLOW ---

  // ADMIN VIEW
  if (isAdminLoggedIn) {
     return (
       <>
         <NotificationContainer notifications={notifications} onClose={removeNotification} />
         <AdminPortal 
            onLogout={handleAdminLogout} 
            currentUser={user}
            systemFees={systemFees}
            onUpdateFees={setSystemFees}
            onResolveDispute={handleDisputeResolution}
          />
       </>
     )
  }

  // PUBLIC AUTH VIEW
  if (!user || !user.isLoggedIn) {
    return (
      <>
        <NotificationContainer notifications={notifications} onClose={removeNotification} />
        <Auth onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      </>
    );
  }

  // CORPORATE PORTAL VIEW
  if (user.isCorporate) {
     return (
        <>
           <NotificationContainer notifications={notifications} onClose={removeNotification} />
           <PinModal 
              isOpen={showPinModal} 
              onClose={() => setShowPinModal(false)} 
              onSuccess={handlePinSuccess}
              expectedPin={user.settings.pin}
           />
           <PaymentModal 
             isOpen={showPaymentModal} 
             type={paymentType} 
             savedBanks={user.bankAccounts}
             onClose={() => setShowPaymentModal(false)}
             onSuccess={handlePaymentSuccess}
           />
           <CryptoModal 
             isOpen={showCryptoModal}
             type={cryptoModalType}
             asset={selectedAsset}
             onClose={() => setShowCryptoModal(false)}
             onSend={handleCryptoSend}
           />
           <CorporatePortal 
              user={user} 
              assets={assets} 
              onLogout={handleLogout} 
              onTrade={handleTrade}
              onDeposit={() => openPayment('DEPOSIT')}
              onWithdraw={() => openPayment('WITHDRAW')}
              onSendCrypto={(id) => openCryptoModal('SEND', id)}
              fxMarkup={systemFees.corporateFxMarkup}
              wireFee={systemFees.wireTransferFeeUsd}
           />
        </>
     )
  }

  // KYC VIEW (Retail Only)
  if (user.kycLevel === KYCLevel.NONE) {
    return (
      <>
        <NotificationContainer notifications={notifications} onClose={removeNotification} />
        <KYC onComplete={handleKYCComplete} />
      </>
    );
  }

  // MAIN RETAIL APP VIEW
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-50 overflow-hidden font-inter">
      
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
      
      {/* SECURITY MODAL */}
      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePinSuccess}
        expectedPin={user.settings.pin} // Pass dynamic PIN
      />

      {/* SESSION WARNING MODAL (SOC 2) */}
      {showSessionWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-rose-500/30 shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 animate-pulse">
                 <Timer size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Session Expiring</h3>
              <p className="text-slate-400 text-sm mb-6">For your security, you will be logged out in less than 60 seconds due to inactivity.</p>
              <button 
                onClick={() => { setShowSessionWarning(false); }} // Simply clicking extends activity
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                I'm still here
              </button>
           </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      <SupportModal 
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        onSubmit={handleSupportSubmit}
      />

      {/* MODALS */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        type={paymentType} 
        savedBanks={user.bankAccounts}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
      
      <CryptoModal 
        isOpen={showCryptoModal}
        type={cryptoModalType}
        asset={selectedAsset}
        onClose={() => setShowCryptoModal(false)}
        onSend={handleCryptoSend}
      />

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              K
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Klastech
              </h1>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wide border border-emerald-500/30 px-1 rounded bg-emerald-500/10">ENTERPRISE</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavButton 
            active={activeTab === TabView.DASHBOARD} 
            onClick={() => setActiveTab(TabView.DASHBOARD)} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={activeTab === TabView.WALLET} 
            onClick={() => setActiveTab(TabView.WALLET)} 
            icon={<WalletIcon size={20} />} 
            label="Wallet & History" 
          />
          <NavButton 
            active={activeTab === TabView.TRADE} 
            onClick={() => setActiveTab(TabView.TRADE)} 
            icon={<Repeat size={20} />} 
            label="Trade & Swap" 
          />
          <NavButton 
            active={activeTab === TabView.P2P} 
            onClick={() => setActiveTab(TabView.P2P)} 
            icon={<Users size={20} />} 
            label="P2P Trading"
          />
           <NavButton 
            active={activeTab === TabView.EARN} 
            onClick={() => setActiveTab(TabView.EARN)} 
            icon={<Coins size={20} />} 
            label="Klastech Earn" 
            badge="NEW"
          />
          <NavButton 
            active={activeTab === TabView.DEVELOPERS} 
            onClick={() => setActiveTab(TabView.DEVELOPERS)} 
            icon={<Code size={20} />} 
            label="Developers" 
          />
          <NavButton 
            active={activeTab === TabView.AI_ASSISTANT} 
            onClick={() => setActiveTab(TabView.AI_ASSISTANT)} 
            icon={<BrainCircuit size={20} />} 
            label="Klastech AI" 
          />
          <NavButton 
            active={activeTab === TabView.SETTINGS} 
            onClick={() => setActiveTab(TabView.SETTINGS)} 
            icon={<SettingsIcon size={20} />} 
            label="Settings" 
          />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <button 
             onClick={() => setShowSupportModal(true)}
             className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-xl transition-colors text-sm font-medium mb-1"
          >
            <LifeBuoy size={20} />
            Help & Support
          </button>
          
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <ShieldAlert size={10} /> Verified Tier 2
              </p>
            </div>
          </div>
          <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-900/20 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
            {activeTab === TabView.WALLET ? 'Wallet & History' : activeTab === TabView.P2P ? 'P2P Trading' : activeTab.replace('_', ' ').toLowerCase()}
            {user.settings.privacyMode && (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-bold uppercase flex items-center gap-1">
                 <EyeOff size={10} /> Privacy Mode
              </span>
            )}
          </h2>
          <div className="flex items-center gap-4">
             {/* Live Market Status Indicator */}
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-900/30 border border-emerald-500/20 rounded-full">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-xs font-medium text-emerald-400">Market Live</span>
             </div>

            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative">
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
              )}
            </button>
            <button className="md:hidden p-2 text-slate-400">
               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                {user.name.charAt(0)}
               </div>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-0 md:p-6 scroll-smooth">
          <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading...</div>}>
            {activeTab === TabView.DASHBOARD && (
              <div>
                 {/* Quick Actions */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                   <button onClick={() => openPayment('DEPOSIT')} className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                     <div className="bg-white/20 p-2 rounded-full"><Plus size={20} /></div>
                     Deposit NGN
                   </button>
                   <button onClick={() => openPayment('WITHDRAW')} className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all">
                     <div className="bg-white/10 p-2 rounded-full"><ArrowUpRight size={20} /></div>
                     Withdraw
                   </button>
                   <button onClick={() => setActiveTab(TabView.TRADE)} className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all">
                     <div className="bg-white/10 p-2 rounded-full"><Repeat size={20} /></div>
                     Swap Crypto
                   </button>
                    <button onClick={() => setActiveTab(TabView.EARN)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition-all shadow-lg shadow-indigo-500/20">
                     <div className="bg-white/10 p-2 rounded-full"><Coins size={20} /></div>
                     Start Earning
                   </button>
                 </div>
                 <Dashboard assets={assets} chartData={chartData} onDeposit={() => openPayment('DEPOSIT')} isPrivacyMode={user.settings.privacyMode} />
              </div>
            )}
            
            {activeTab === TabView.TRADE && <Trade assets={assets} onTrade={handleTrade} feePercentage={systemFees.retailTradingFee} />}
            
            {activeTab === TabView.EARN && <Earn assets={assets} onStake={handleStake} onUnstake={handleUnstake} />}

            {activeTab === TabView.P2P && <P2P assets={assets} user={user} onOrderComplete={handleP2POrderComplete} onOrderCreate={handleP2POrderCreate} onOrderCancel={handleP2POrderCancel} />}
            
            {activeTab === TabView.DEVELOPERS && <DeveloperPortal />}

            {activeTab === TabView.AI_ASSISTANT && (
              <div className="max-w-4xl mx-auto">
                <AIChat assets={assets} />
              </div>
            )}

            {activeTab === TabView.WALLET && (
              <Wallet 
                assets={assets} 
                transactions={transactions} 
                onDeposit={() => openPayment('DEPOSIT')}
                onSendCrypto={(id) => openCryptoModal('SEND', id)}
                onReceiveCrypto={(id) => openCryptoModal('RECEIVE', id)}
                isPrivacyMode={user.settings.privacyMode}
              />
            )}

            {activeTab === TabView.SETTINGS && (
              <Settings user={user} onUpdateUser={handleUpdateUser} />
            )}
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-4 z-50 safe-area-bottom">
        <button onClick={() => setActiveTab(TabView.DASHBOARD)} className={`p-2 rounded-lg ${activeTab === TabView.DASHBOARD ? 'text-indigo-400 bg-indigo-900/20' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} />
        </button>
        <button onClick={() => setActiveTab(TabView.TRADE)} className={`p-2 rounded-lg ${activeTab === TabView.TRADE ? 'text-indigo-400 bg-indigo-900/20' : 'text-slate-400'}`}>
          <Repeat size={24} />
        </button>
        <button onClick={() => setActiveTab(TabView.P2P)} className={`p-2 rounded-lg ${activeTab === TabView.P2P ? 'text-indigo-400 bg-indigo-900/20' : 'text-slate-400'}`}>
          <Users size={24} />
        </button>
        <button onClick={() => setActiveTab(TabView.WALLET)} className={`p-2 rounded-lg ${activeTab === TabView.WALLET ? 'text-indigo-400 bg-indigo-900/20' : 'text-slate-400'}`}>
          <WalletIcon size={24} />
        </button>
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, badge }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span className={`transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
      {icon}
    </span>
    <span className="font-medium text-sm flex-1 text-left">{label}</span>
    {badge && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">{badge}</span>}
  </button>
);