
import { Asset, AssetType, Transaction, P2PAd, ApiMetric, UserProfile, KYCLevel, DisputeCase, SessionActivity } from './types';

// Exchange Rate: 1 USD = 1550 NGN (Simulated)
export const NGN_USD_RATE = 1550;

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: AssetType.CRYPTO,
    priceUsd: 64230.50,
    balance: 0.045,
    stakedBalance: 0,
    change24h: 2.4,
    iconUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029',
    color: '#F7931A'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    type: AssetType.CRYPTO,
    priceUsd: 3450.20,
    balance: 1.2,
    stakedBalance: 0.5, // Initial simulated stake
    change24h: -1.1,
    iconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029',
    color: '#627EEA'
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    type: AssetType.CRYPTO,
    priceUsd: 1.00,
    balance: 450.00,
    stakedBalance: 1000.00, // Initial simulated stake
    change24h: 0.01,
    iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=029',
    color: '#26A17B'
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    type: AssetType.CRYPTO,
    priceUsd: 1.00,
    balance: 120.50,
    stakedBalance: 0,
    change24h: 0.00,
    iconUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=029',
    color: '#2775CA'
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    type: AssetType.CRYPTO,
    priceUsd: 145.60,
    balance: 15.0,
    stakedBalance: 0,
    change24h: 5.6,
    iconUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=029',
    color: '#14F195'
  },
  {
    id: 'naira',
    symbol: 'NGN',
    name: 'Nigerian Naira',
    type: AssetType.FIAT,
    priceUsd: 1 / NGN_USD_RATE,
    balance: 500000,
    stakedBalance: 250000, // Initial simulated stake
    change24h: 0,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Naira_symbol.svg/1200px-Naira_symbol.svg.png',
    color: '#008751'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'BUY',
    fromSymbol: 'NGN',
    toSymbol: 'BTC',
    fromAmount: 150000,
    toAmount: 0.0015,
    date: '2023-10-25 14:30',
    status: 'COMPLETED'
  },
  {
    id: 'tx_2',
    type: 'SWAP',
    fromSymbol: 'ETH',
    toSymbol: 'USDT',
    fromAmount: 0.5,
    toAmount: 1725,
    date: '2023-10-24 09:15',
    status: 'COMPLETED'
  },
  {
    id: 'tx_3',
    type: 'SELL',
    fromSymbol: 'SOL',
    toSymbol: 'NGN',
    fromAmount: 2,
    toAmount: 450000,
    date: '2023-10-22 18:45',
    status: 'COMPLETED'
  },
  {
    id: 'tx_4',
    type: 'P2P_BUY',
    fromSymbol: 'NGN',
    toSymbol: 'USDT',
    fromAmount: 50000,
    toAmount: 32.5,
    date: '2023-10-20 12:00',
    status: 'COMPLETED'
  }
];

export const CHART_DATA = [
  { time: '00:00', value: 45000 },
  { time: '04:00', value: 46200 },
  { time: '08:00', value: 45800 },
  { time: '12:00', value: 47500 },
  { time: '16:00', value: 46900 },
  { time: '20:00', value: 48200 },
  { time: '23:59', value: 49500 },
];

export const API_METRICS: ApiMetric[] = [
  { time: '10:00', requests: 120, errors: 2, latencyMs: 45 },
  { time: '11:00', requests: 450, errors: 5, latencyMs: 52 },
  { time: '12:00', requests: 890, errors: 12, latencyMs: 68 },
  { time: '13:00', requests: 670, errors: 8, latencyMs: 55 },
  { time: '14:00', requests: 230, errors: 1, latencyMs: 48 },
  { time: '15:00', requests: 560, errors: 4, latencyMs: 62 },
  { time: '16:00', requests: 940, errors: 6, latencyMs: 58 },
];

export const MOCK_P2P_ADS: P2PAd[] = [
  {
    id: 'ad_1',
    type: 'BUY',
    assetId: 'tether',
    makerName: 'FastPayer_NG',
    completionRate: 98.5,
    totalOrders: 1240,
    price: 1565.50,
    minLimit: 5000,
    maxLimit: 500000,
    paymentMethods: ['Bank Transfer', 'Chipper Cash'],
    availableAmount: 5000
  },
  {
    id: 'ad_2',
    type: 'BUY',
    assetId: 'tether',
    makerName: 'CryptoKing_01',
    completionRate: 92.0,
    totalOrders: 450,
    price: 1562.00,
    minLimit: 100000,
    maxLimit: 2000000,
    paymentMethods: ['Bank Transfer'],
    availableAmount: 12500
  },
  {
    id: 'ad_3',
    type: 'SELL',
    assetId: 'tether',
    makerName: 'TrustVendor',
    completionRate: 99.9,
    totalOrders: 3200,
    price: 1580.00,
    minLimit: 2000,
    maxLimit: 150000,
    paymentMethods: ['Bank Transfer', 'OPay'],
    availableAmount: 2000
  },
  {
    id: 'ad_4',
    type: 'BUY',
    assetId: 'bitcoin',
    makerName: 'SatoshiNaira',
    completionRate: 95.5,
    totalOrders: 800,
    price: 98500500, // Approx NGN price
    minLimit: 50000,
    maxLimit: 5000000,
    paymentMethods: ['Bank Transfer'],
    availableAmount: 0.5
  },
  {
    id: 'ad_5',
    type: 'SELL',
    assetId: 'ethereum',
    makerName: 'EthMerchant',
    completionRate: 97.2,
    totalOrders: 150,
    price: 5200000,
    minLimit: 20000,
    maxLimit: 1000000,
    paymentMethods: ['Kuda Bank', 'PalmPay'],
    availableAmount: 10
  }
];

// --- ADMIN MOCK DATA ---

export const MOCK_USERS_DB: UserProfile[] = [
  {
    id: 'usr_001',
    name: 'Chinedu Okeke',
    email: 'chinedu@example.com',
    kycLevel: KYCLevel.TIER_2,
    isLoggedIn: false,
    emailVerified: true,
    settings: { currency: 'NGN', twoFactorEnabled: true, emailNotifications: true, theme: 'dark', pin: '1234', privacyMode: false },
    bankAccounts: [],
    status: 'ACTIVE',
    joinedDate: '2023-01-15'
  },
  {
    id: 'usr_002',
    name: 'Amina Bello',
    email: 'amina.b@test.com',
    kycLevel: KYCLevel.TIER_1,
    isLoggedIn: false,
    emailVerified: true,
    settings: { currency: 'NGN', twoFactorEnabled: false, emailNotifications: true, theme: 'light', pin: '1234', privacyMode: false },
    bankAccounts: [],
    status: 'ACTIVE',
    joinedDate: '2023-03-22'
  },
  {
    id: 'usr_003',
    name: 'Suspicious Actor',
    email: 'hacker@darkweb.xyz',
    kycLevel: KYCLevel.NONE,
    isLoggedIn: false,
    emailVerified: false,
    settings: { currency: 'USD', twoFactorEnabled: false, emailNotifications: false, theme: 'dark', pin: '0000', privacyMode: false },
    bankAccounts: [],
    status: 'FROZEN',
    joinedDate: '2023-11-01'
  },
  {
    id: 'usr_004',
    name: 'Tunde Bakare',
    email: 'tunde@ventures.ng',
    kycLevel: KYCLevel.TIER_2,
    isLoggedIn: false,
    emailVerified: true,
    settings: { currency: 'NGN', twoFactorEnabled: true, emailNotifications: true, theme: 'dark', pin: '5555', privacyMode: false },
    bankAccounts: [],
    status: 'ACTIVE',
    joinedDate: '2022-12-10'
  },
  {
    id: 'corp_001',
    name: 'Lagos Logistics Ltd',
    organizationName: 'Lagos Logistics Ltd',
    rcNumber: 'RC1234567',
    email: 'finance@lagoslogistics.com',
    kycLevel: KYCLevel.CORPORATE_VERIFIED,
    isLoggedIn: false,
    emailVerified: true,
    isCorporate: true,
    settings: { currency: 'USD', twoFactorEnabled: true, emailNotifications: true, theme: 'dark', pin: '9999', privacyMode: false },
    bankAccounts: [],
    status: 'ACTIVE',
    joinedDate: '2023-05-15'
  }
];

export const MOCK_DISPUTES: DisputeCase[] = [
  {
    id: 'dsp_8821',
    orderId: 'p2p_9921',
    buyerName: 'Chinedu Okeke',
    sellerName: 'TrustVendor',
    amountFiat: 50000,
    amountCrypto: 31.5,
    asset: 'USDT',
    reason: 'Seller refused to release crypto after payment.',
    status: 'OPEN',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    // Enhanced Data
    buyerStats: { totalOrders: 42, completionRate: 95.5, joinedDate: '2023-01-15' },
    sellerStats: { totalOrders: 3200, completionRate: 99.9, joinedDate: '2022-08-10' },
    timeline: [
      { title: 'Order Created', time: '14:30', status: 'DONE' },
      { title: 'Buyer Marked Paid', time: '14:45', status: 'DONE' },
      { title: 'Seller Reported Non-Receipt', time: '15:15', status: 'WARNING' },
      { title: 'Dispute Raised', time: '15:20', status: 'WARNING' }
    ],
    chatTranscript: [
       { sender: 'SYSTEM', text: 'Order Created. Assets locked in escrow.', timestamp: '14:30' },
       { sender: 'BUYER', text: 'Hi, paying now. Are you online?', timestamp: '14:32' },
       { sender: 'SELLER', text: 'Yes, online. Proceed.', timestamp: '14:33' },
       { sender: 'SYSTEM', text: 'Buyer marked order as paid.', timestamp: '14:45' },
       { sender: 'BUYER', text: 'Paid. Please release.', timestamp: '14:45' },
       { sender: 'SELLER', text: 'I have not seen the alert yet. Please wait.', timestamp: '14:50' },
       { sender: 'BUYER', text: 'It has been 30 mins! Release my coins!', timestamp: '15:15' },
       { sender: 'SELLER', text: 'Stop spamming. No money, no crypto.', timestamp: '15:16' }
    ],
    evidenceImages: [
       'https://via.placeholder.com/600x400/0f172a/ffffff?text=Bank+Receipt+Proof',
       'https://via.placeholder.com/600x400/0f172a/ffffff?text=Debit+Alert+SMS'
    ]
  }
];

export const MOCK_SESSION_LOGS: SessionActivity[] = [
  { id: 'sess_1', device: 'Chrome on Windows 11', location: 'Lagos, NG', ip: '102.12.33.41', lastActive: 'Current Session', isCurrent: true },
  { id: 'sess_2', device: 'Klass Mobile App (iPhone 13)', location: 'Lagos, NG', ip: '197.210.64.2', lastActive: '2 hours ago', isCurrent: false },
  { id: 'sess_3', device: 'Safari on Mac OS', location: 'Abuja, NG', ip: '105.112.11.8', lastActive: '3 days ago', isCurrent: false },
];
