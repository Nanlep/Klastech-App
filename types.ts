
export enum AssetType {
  CRYPTO = 'CRYPTO',
  FIAT = 'FIAT'
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  priceUsd: number;
  balance: number;
  stakedBalance: number; // New field for Earn module
  change24h: number; // Percentage
  iconUrl: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'SWAP' | 'DEPOSIT' | 'WITHDRAW' | 'STAKE' | 'UNSTAKE' | 'P2P_BUY' | 'P2P_SELL' | 'P2P_LOCK' | 'P2P_REFUND' | 'FX_CONVERSION' | 'WIRE_OUT';
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  date: string; // ISO String
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'OPEN';
  price?: number; // For limit orders or effective rate
  orderType?: 'MARKET' | 'LIMIT';
  fee?: number;
  userId?: string; // Added for Admin view
}

export interface MarketDataPoint {
  time: string;
  value: number;
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  WALLET = 'WALLET',
  TRADE = 'TRADE',
  P2P = 'P2P',
  EARN = 'EARN',
  AI_ASSISTANT = 'AI_ASSISTANT',
  SETTINGS = 'SETTINGS',
  DEVELOPERS = 'DEVELOPERS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  CORPORATE_PORTAL = 'CORPORATE_PORTAL'
}

export enum KYCLevel {
  NONE = 0,
  TIER_1 = 1, // BVN Verified
  TIER_2 = 2, // ID Verified
  CORPORATE_VERIFIED = 3 // Business Verified
}

export interface UserSettings {
  currency: 'NGN' | 'USD';
  twoFactorEnabled: boolean;
  twoFactorSecret?: string; // For TOTP
  emailNotifications: boolean;
  theme: 'dark' | 'light';
  pin: string;
  privacyMode: boolean; // ISO 27001: Data Masking
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface SessionActivity {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  kycLevel: KYCLevel;
  isLoggedIn: boolean;
  emailVerified: boolean; // New Field
  settings: UserSettings;
  bankAccounts: BankAccount[];
  referralCode?: string;
  referralEarnings?: number;
  status?: 'ACTIVE' | 'FROZEN' | 'BANNED'; // For Admin
  joinedDate?: string;
  
  // Corporate Specific
  isCorporate?: boolean;
  organizationName?: string;
  rcNumber?: string;
}

export interface SystemFees {
  retailTradingFee: number; // e.g., 0.005 for 0.5%
  corporateFxMarkup: number; // e.g., 0.002 for 0.2%
  withdrawalFeeFixed: number; // e.g., 50 NGN
  p2pFee: number; // e.g., 0.001 for 0.1%
  wireTransferFeeUsd: number; // e.g., 35 USD
}

export type NotificationType = 'SUCCESS' | 'ERROR' | 'INFO';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
}

// --- P2P TYPES ---

export interface P2PAd {
  id: string;
  type: 'BUY' | 'SELL'; // User perspective: BUY means user buys from maker
  assetId: string;
  makerName: string;
  makerAvatar?: string;
  completionRate: number;
  totalOrders: number;
  price: number; // Fixed price in NGN
  minLimit: number;
  maxLimit: number;
  paymentMethods: string[];
  availableAmount: number;
}

export interface P2PChatMessage {
  id: string;
  sender: 'ME' | 'COUNTERPARTY' | 'SYSTEM';
  text: string;
  timestamp: string;
}

export interface P2POrder {
  id: string;
  adId: string;
  type: 'BUY' | 'SELL';
  assetSymbol: string;
  fiatAmount: number;
  cryptoAmount: number;
  price: number;
  counterpartyName: string;
  status: 'CREATED' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'DISPUTE';
  created: string;
  chatHistory: P2PChatMessage[];
  paymentDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

// --- DEVELOPER TYPES ---

export type ApiScope = 'wallets:read' | 'trade:execute' | 'transfers:write' | 'webhooks:manage' | 'kyc:read';

export interface ApiKey {
  id: string;
  keyMasked: string;
  label: string;
  scopes: ApiScope[];
  ipWhitelist?: string[]; // CIDR format
  createdAt: string;
  lastUsed?: string;
  status: 'ACTIVE' | 'REVOKED';
  environment: 'SANDBOX' | 'LIVE';
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  status: 'ACTIVE' | 'FAILED' | 'INACTIVE';
  failureCount: number;
  lastDelivery?: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  latencyMs: number;
  requestBody?: string;
  responseBody?: string;
  ip?: string;
  userAgent?: string;
}

export interface ApiMetric {
  time: string;
  requests: number;
  errors: number;
  latencyMs: number;
}

// --- ADMIN TYPES ---

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  timestamp: string;
  details: string;
}

export interface DisputeCase {
  id: string;
  orderId: string;
  buyerName: string;
  sellerName: string;
  amountFiat: number;
  amountCrypto: number;
  asset: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';
  timestamp: string;
  
  // Enhanced Fields
  chatTranscript: { sender: 'BUYER' | 'SELLER' | 'SYSTEM'; text: string; timestamp: string }[];
  evidenceImages: string[];
  buyerStats: { totalOrders: number; completionRate: number; joinedDate: string };
  sellerStats: { totalOrders: number; completionRate: number; joinedDate: string };
  timeline: { title: string; time: string; status: 'DONE' | 'PENDING' | 'WARNING' }[];
}
