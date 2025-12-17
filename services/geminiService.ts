import { GoogleGenAI } from "@google/genai";
import { Asset } from "../types";

const apiKey = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getGeminiAdvice = async (
  query: string, 
  portfolioContext: Asset[]
): Promise<string> => {
  if (!ai) return "API Key not configured.";

  try {
    const contextString = portfolioContext.map(a => 
      `${a.name} (${a.symbol}): Avail ${a.balance}, Staked ${a.stakedBalance || 0}, Price $${a.priceUsd}`
    ).join('\n');

    const prompt = `
      You are "Klastech AI", an expert crypto financial advisor for the Nigerian market using the Klastech Wallet.
      
      User Portfolio:
      ${contextString}

      Services Available in Klastech:
      1. Klastech Earn: High yield savings (15.5% APY on NGN, 8% on USDT/USDC, 4.5% ETH).
      2. Trade: Instant Buy/Sell/Swap with Market & Limit orders.
      3. Wallet: Secure NGN deposits/withdrawals via Paystack.

      Current Market Context: Bitcoin is around $64k. The Naira is volatile.
      
      User Question: "${query}"
      
      Provide a concise, helpful answer (under 150 words). Format with markdown. 
      If the user has idle stablecoins or Naira, STRONGLY recommend "Klastech Earn" to fight inflation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I'm having trouble connecting to the market data right now.";
  }
};