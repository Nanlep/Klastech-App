import { UserProfile, Asset, Transaction, P2POrder } from '../types';

// CHANGE THIS TO 'true' WHEN CONNECTED TO NESTJS BACKEND
const USE_LIVE_BACKEND = false;
const API_URL = 'http://localhost:3001/api/v1';

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      if (USE_LIVE_BACKEND) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        return res.json();
      }
      // Mock handled in App.tsx
      return null;
    },
    register: async (data: any) => {
      if (USE_LIVE_BACKEND) {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return res.json();
      }
      return null;
    }
  },

  wallet: {
    getBalance: async (token: string) => {
      if (USE_LIVE_BACKEND) {
        const res = await fetch(`${API_URL}/wallets`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
      }
      return [];
    },
    withdraw: async (token: string, data: { assetId: string, amount: number, bankId: string }) => {
      if (USE_LIVE_BACKEND) {
        return fetch(`${API_URL}/wallets/withdraw`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
    }
  },

  p2p: {
    createOrder: async (token: string, order: any) => {
      if (USE_LIVE_BACKEND) {
        return fetch(`${API_URL}/p2p/orders`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
      }
    }
  }
};