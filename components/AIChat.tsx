import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Asset } from '../types';
import { getGeminiAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  assets: Asset[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat: React.FC<AIChatProps> = ({ assets }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am **Klastech AI**. Ask me about crypto trends, your portfolio, or how to get the best Naira rates.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    const response = await getGeminiAdvice(userMsg, assets);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[600px] flex flex-col bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-indigo-500/20 p-2 rounded-lg">
          <Sparkles className="text-indigo-400" size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold">Klastech Market Assistant</h3>
          <p className="text-xs text-slate-400">Powered by Gemini</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {msg.role === 'user' ? <User size={14} text-white /> : <Bot size={14} text-white />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-700 text-slate-100 rounded-tl-none'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
               <Bot size={14} className="text-white" />
             </div>
             <div className="bg-slate-700 rounded-2xl p-3 rounded-tl-none flex items-center gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-700">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about ETH price, or swap advice..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};