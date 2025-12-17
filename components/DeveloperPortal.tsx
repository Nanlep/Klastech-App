import React, { useState, useEffect } from 'react';
import { Terminal, Key, Webhook, Activity, Plus, Trash2, Eye, EyeOff, Copy, Check, AlertCircle, Server, Shield, ChevronRight, Play, RefreshCw, Code, Lock, ChevronLeft, Book, FileText, Hash, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ApiKey, WebhookConfig, ApiLog, ApiScope } from '../types';
import { API_METRICS } from '../constants';

export const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KEYS' | 'WEBHOOKS' | 'PLAYGROUND' | 'LOGS' | 'DOCS'>('OVERVIEW');
  const [environment, setEnvironment] = useState<'SANDBOX' | 'LIVE'>('SANDBOX');
  
  // --- STATE MANAGEMENT ---
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'key_1', keyMasked: 'pk_live_...9f2a', label: 'Backend Server', scopes: ['wallets:read', 'trade:execute'], createdAt: new Date().toISOString(), status: 'ACTIVE', environment: 'LIVE', ipWhitelist: ['102.12.33.0/24'] },
    { id: 'key_2', keyMasked: 'pk_test_...b2c1', label: 'Dev Laptop', scopes: ['wallets:read', 'transfers:write', 'webhooks:manage'], createdAt: new Date().toISOString(), status: 'ACTIVE', environment: 'SANDBOX' }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    { id: 'wh_1', url: 'https://api.myapp.com/webhooks/klastech', events: ['payment.success', 'p2p.order_created'], secret: 'whsec_...a1b2', status: 'ACTIVE', failureCount: 0, lastDelivery: new Date().toISOString() }
  ]);

  const [logs, setLogs] = useState<ApiLog[]>([
    { id: 'req_123', timestamp: new Date(Date.now() - 5000).toISOString(), method: 'POST', endpoint: '/v1/payments', status: 201, latencyMs: 245, requestBody: '{"amount": 5000, "currency": "NGN"}', responseBody: '{"id": "pay_888", "status": "pending"}' },
    { id: 'req_124', timestamp: new Date(Date.now() - 15000).toISOString(), method: 'GET', endpoint: '/v1/wallets', status: 200, latencyMs: 45, responseBody: '{"balance": 450000}' },
    { id: 'req_125', timestamp: new Date(Date.now() - 35000).toISOString(), method: 'POST', endpoint: '/v1/p2p/orders', status: 400, latencyMs: 12, requestBody: '{"asset": "BTC"}', responseBody: '{"error": "Invalid asset symbol"}' },
  ]);

  // --- MODAL STATES ---
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyDetails, setNewKeyDetails] = useState<{key: string, secret: string} | null>(null);
  
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

  // --- PLAYGROUND STATE ---
  const [pgMethod, setPgMethod] = useState<'GET' | 'POST'>('GET');
  const [pgEndpoint, setPgEndpoint] = useState('/v1/wallets');
  const [pgBody, setPgBody] = useState('{}');
  const [pgResponse, setPgResponse] = useState<string | null>(null);
  const [pgLoading, setPgLoading] = useState(false);

  // --- DOCS STATE ---
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [docSection, setDocSection] = useState<'intro' | 'auth' | 'wallets' | 'webhooks'>('intro');

  // --- HANDLERS ---
  const handleCreateKey = (label: string, scopes: ApiScope[], ips: string) => {
    const prefix = environment === 'LIVE' ? 'pk_live_' : 'pk_test_';
    const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fullKey = `${prefix}${randomPart}`;
    
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      label,
      keyMasked: `${prefix}...${randomPart.slice(-4)}`,
      scopes,
      ipWhitelist: ips ? ips.split(',').map(s => s.trim()) : [],
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      environment
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyDetails({ key: newKey.id, secret: fullKey }); // Show full key once
    setShowKeyModal(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure? This will immediately revoke access for any system using this key.')) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
    }
  };

  const handleCreateWebhook = (url: string, events: string[]) => {
    const newHook: WebhookConfig = {
      id: `wh_${Date.now()}`,
      url,
      events,
      secret: `whsec_${Math.random().toString(36).substring(7)}`,
      status: 'ACTIVE',
      failureCount: 0
    };
    setWebhooks([...webhooks, newHook]);
    setShowWebhookModal(false);
  };

  const handleTestWebhook = (hook: WebhookConfig) => {
    alert(`Test event sent to ${hook.url}. Signature verified.`);
    // In a real app, this would make a backend call
  };

  const runPlaygroundRequest = () => {
    setPgLoading(true);
    setPgResponse(null);

    setTimeout(() => {
      // Simulate Response
      const isSuccess = Math.random() > 0.1;
      const status = isSuccess ? (pgMethod === 'POST' ? 201 : 200) : 400;
      const latency = Math.floor(Math.random() * 200) + 20;
      
      let respBody = '';
      if (pgEndpoint.includes('wallets')) respBody = JSON.stringify({ data: { balance: 500000, currency: 'NGN' } }, null, 2);
      else if (pgEndpoint.includes('payments')) respBody = JSON.stringify({ id: 'pay_mock', status: 'success' }, null, 2);
      else respBody = JSON.stringify({ message: 'Resource found' }, null, 2);

      if (!isSuccess) respBody = JSON.stringify({ error: 'Bad Request', code: 'invalid_params' }, null, 2);

      const newLog: ApiLog = {
        id: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        method: pgMethod,
        endpoint: pgEndpoint,
        status,
        latencyMs: latency,
        requestBody: pgMethod === 'POST' ? pgBody : undefined,
        responseBody: respBody
      };

      setLogs([newLog, ...logs]);
      setPgResponse(respBody);
      setPgLoading(false);
    }, 800);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden font-inter animate-fade-in bg-[#0b1120]">
      
      {/* SIDEBAR */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-6">
           <div className="bg-slate-900 rounded-xl p-1 flex items-center border border-slate-800 mb-6 shadow-inner">
              <button 
                onClick={() => setEnvironment('SANDBOX')}
                className={`flex-1 text-[10px] font-extrabold uppercase py-2 rounded-lg transition-all ${environment === 'SANDBOX' ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/50' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sandbox
              </button>
              <button 
                onClick={() => setEnvironment('LIVE')}
                className={`flex-1 text-[10px] font-extrabold uppercase py-2 rounded-lg transition-all ${environment === 'LIVE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Live Data
              </button>
           </div>
           
           <nav className="space-y-1">
             <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<Activity size={18} />} label="Overview" />
             <TabButton active={activeTab === 'KEYS'} onClick={() => setActiveTab('KEYS')} icon={<Key size={18} />} label="API Keys" />
             <TabButton active={activeTab === 'WEBHOOKS'} onClick={() => setActiveTab('WEBHOOKS')} icon={<Webhook size={18} />} label="Webhooks" />
             <TabButton active={activeTab === 'PLAYGROUND'} onClick={() => setActiveTab('PLAYGROUND')} icon={<Play size={18} />} label="Playground" />
             <TabButton active={activeTab === 'LOGS'} onClick={() => setActiveTab('LOGS')} icon={<Terminal size={18} />} label="Request Logs" />
             <TabButton active={activeTab === 'DOCS'} onClick={() => setActiveTab('DOCS')} icon={<Code size={18} />} label="Documentation" />
           </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
           <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="relative">
                <Server size={18} className="text-emerald-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
              <div>
                 <p className="text-xs font-bold text-white">System Status</p>
                 <p className="text-[10px] text-emerald-400 font-mono">99.99% Uptime</p>
              </div>
           </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-[#0b1120] p-0 md:p-8 relative">
         
         {/* --- OVERVIEW TAB --- */}
         {activeTab === 'OVERVIEW' && (
           <div className="max-w-6xl space-y-8 animate-fade-in p-6 md:p-0">
              <header className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                   <h2 className="text-3xl font-bold text-white mb-2">Developer Dashboard</h2>
                   <p className="text-slate-400 text-sm">Monitor your integration performance and usage.</p>
                </div>
                <div className="flex gap-2">
                   <div className="text-right px-4 py-2 bg-slate-900 rounded-lg border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Current Plan</p>
                      <p className="text-indigo-400 font-bold text-sm">Enterprise Tier</p>
                   </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <MetricCard label="Total Requests" value="1.2M" change="+12%" icon={<Activity className="text-indigo-400" />} />
                 <MetricCard label="P95 Latency" value="48ms" change="-2ms" icon={<Server className="text-emerald-400" />} />
                 <MetricCard label="Success Rate" value="99.9%" change="+0.1%" icon={<Shield className="text-emerald-400" />} />
                 <MetricCard label="Failed Webhooks" value="2" change="0%" icon={<AlertCircle className="text-amber-400" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-white font-bold">Traffic Volume (24h)</h3>
                       <select className="bg-slate-950 border border-slate-700 text-xs text-slate-400 rounded-lg px-2 py-1 outline-none">
                          <option>Last 24 Hours</option>
                          <option>Last 7 Days</option>
                       </select>
                    </div>
                    <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={API_METRICS}>
                           <defs>
                             <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                           <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                           <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                           <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
                    <h3 className="text-white font-bold mb-4">Error Distribution</h3>
                    <div className="flex-1 flex items-center justify-center">
                       <div className="relative w-40 h-40">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                             <circle cx="80" cy="80" r="70" stroke="#f43f5e" strokeWidth="10" fill="transparent" strokeDasharray="440" strokeDashoffset="420" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-3xl font-bold text-white">0.04%</span>
                             <span className="text-xs text-slate-500">Error Rate</span>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-3 mt-4">
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 4xx Errors</span>
                          <span className="text-white font-mono">124</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 5xx Errors</span>
                          <span className="text-white font-mono">4</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {/* --- API KEYS TAB --- */}
         {activeTab === 'KEYS' && (
           <div className="max-w-5xl space-y-6 animate-fade-in p-6 md:p-0">
              <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-white">API Keys</h2>
                    <p className="text-slate-400 text-sm mt-1">
                       Managing credentials for <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${environment === 'LIVE' ? 'bg-indigo-900 text-indigo-300' : 'bg-amber-900 text-amber-500'}`}>{environment}</span> environment.
                    </p>
                 </div>
                 <button onClick={() => setShowKeyModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus size={18} /> Create New Key
                 </button>
              </div>

              {newKeyDetails && (
                 <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl mb-6 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                       <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Check size={24} /></div>
                       <div>
                          <h3 className="text-emerald-400 font-bold">API Key Created Successfully</h3>
                          <p className="text-emerald-200/70 text-sm mt-1">Copy this key now. You will not be able to see it again.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 border border-emerald-500/30 rounded-xl p-4">
                       <code className="flex-1 font-mono text-emerald-400 text-sm break-all">{newKeyDetails.secret}</code>
                       <button onClick={() => navigator.clipboard.writeText(newKeyDetails.secret)} className="text-slate-400 hover:text-white"><Copy size={18} /></button>
                    </div>
                    <button onClick={() => setNewKeyDetails(null)} className="self-end text-sm font-bold text-emerald-400 hover:text-emerald-300">Done</button>
                 </div>
              )}

              <div className="space-y-4">
                 {apiKeys.filter(k => k.environment === environment).map(key => (
                    <div key={key.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-slate-700 transition-colors">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-white font-bold text-lg">{key.label}</h3>
                             <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold tracking-wide">ACTIVE</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                             <span className="font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded border border-slate-800 text-sm">{key.keyMasked}</span>
                             <span className="text-xs text-slate-500">Created {new Date(key.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2">
                             {key.scopes.map(scope => (
                                <span key={scope} className="text-[10px] font-bold text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-500/20">{scope}</span>
                             ))}
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-6">
                          {key.ipWhitelist && key.ipWhitelist.length > 0 && (
                             <div className="text-right hidden md:block">
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">IP Whitelist</p>
                                <p className="text-xs text-slate-300 font-mono bg-slate-800 px-2 py-1 rounded">{key.ipWhitelist[0]}</p>
                             </div>
                          )}
                          <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
                          <button onClick={() => handleDeleteKey(key.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Revoke Key">
                             <Trash2 size={20} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
              
              {showKeyModal && (
                 <KeyCreationModal onClose={() => setShowKeyModal(false)} onCreate={handleCreateKey} />
              )}
           </div>
         )}

         {/* --- PLAYGROUND TAB --- */}
         {activeTab === 'PLAYGROUND' && (
           <div className="h-full flex flex-col max-w-6xl mx-auto animate-fade-in p-6 md:p-0">
             <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">API Playground</h2>
                <p className="text-slate-400 text-sm">Test endpoints directly from your browser. Requests are logged.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-6">
                {/* Request Panel */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                   <div className="p-4 border-b border-slate-800 bg-slate-950 flex gap-2">
                      <select 
                        value={pgMethod} 
                        onChange={(e) => setPgMethod(e.target.value as any)}
                        className="bg-slate-800 text-white font-bold text-sm px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-indigo-500"
                      >
                         <option value="GET">GET</option>
                         <option value="POST">POST</option>
                         <option value="PUT">PUT</option>
                         <option value="DELETE">DELETE</option>
                      </select>
                      <input 
                        type="text" 
                        value={pgEndpoint}
                        onChange={(e) => setPgEndpoint(e.target.value)}
                        className="flex-1 bg-slate-800 text-slate-200 font-mono text-sm px-4 py-2 rounded-lg border border-slate-700 outline-none focus:border-indigo-500" 
                      />
                      <button 
                        onClick={runPlaygroundRequest}
                        disabled={pgLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                         {pgLoading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />} Send
                      </button>
                   </div>
                   <div className="flex-1 p-4 flex flex-col">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2">Request Body (JSON)</label>
                      <textarea 
                        value={pgBody}
                        onChange={(e) => setPgBody(e.target.value)}
                        className="flex-1 bg-slate-950 text-indigo-100 font-mono text-xs p-4 rounded-xl border border-slate-800 outline-none focus:border-indigo-500 resize-none"
                      />
                   </div>
                </div>

                {/* Response Panel */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                   <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Response</span>
                      {pgResponse && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                           200 OK
                        </span>
                      )}
                   </div>
                   <div className="flex-1 bg-[#0d1321] p-4 overflow-auto">
                      {pgResponse ? (
                         <pre className="font-mono text-xs text-emerald-300 leading-relaxed">
                            {pgResponse}
                         </pre>
                      ) : (
                         <div className="h-full flex flex-col items-center justify-center text-slate-600">
                            <Activity size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">Run a request to see response</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
           </div>
         )}

         {/* --- LOGS TAB --- */}
         {activeTab === 'LOGS' && (
           <div className="max-w-6xl space-y-6 animate-fade-in relative p-6 md:p-0">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Live Logs</h2>
                 <button className="text-xs bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700">Clear Logs</button>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                       <tr>
                          <th className="p-4">Status</th>
                          <th className="p-4">Method</th>
                          <th className="p-4">Endpoint</th>
                          <th className="p-4">Latency</th>
                          <th className="p-4">Time</th>
                          <th className="p-4"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                       {logs.map(log => (
                          <tr 
                            key={log.id} 
                            onClick={() => setSelectedLog(log)}
                            className="hover:bg-slate-800 cursor-pointer transition-colors group"
                          >
                             <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                   log.status >= 200 && log.status < 300 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                   {log.status}
                                </span>
                             </td>
                             <td className="p-4 font-mono text-slate-300 text-xs">{log.method}</td>
                             <td className="p-4 text-slate-400 text-xs font-mono">{log.endpoint}</td>
                             <td className="p-4 text-slate-500 text-xs">{log.latencyMs}ms</td>
                             <td className="p-4 text-slate-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                             <td className="p-4 text-right">
                                <ChevronRight size={16} className="text-slate-600 group-hover:text-white inline-block" />
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* LOG INSPECTOR DRAWER */}
              {selectedLog && (
                 <div className="absolute top-0 right-0 h-full w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl animate-slide-in-right z-20 flex flex-col">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                       <h3 className="font-bold text-white">Request Details</h3>
                       <button onClick={() => setSelectedLog(null)}><Trash2 size={16} className="text-slate-500" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Metadata</label>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-800 p-3 rounded-lg"><p className="text-xs text-slate-400">ID</p><p className="text-white font-mono text-sm">{selectedLog.id}</p></div>
                             <div className="bg-slate-800 p-3 rounded-lg"><p className="text-xs text-slate-400">Time</p><p className="text-white font-mono text-sm">{new Date(selectedLog.timestamp).toISOString()}</p></div>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Request Body</label>
                          <pre className="bg-[#0b1120] p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                             {selectedLog.requestBody || 'No body content'}
                          </pre>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Response Body</label>
                          <pre className="bg-[#0b1120] p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                             {selectedLog.responseBody}
                          </pre>
                       </div>
                    </div>
                 </div>
              )}
           </div>
         )}
         
         {/* --- WEBHOOKS TAB --- */}
         {activeTab === 'WEBHOOKS' && (
            <div className="max-w-5xl space-y-6 animate-fade-in p-6 md:p-0">
               <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-white">Webhooks</h2>
                    <p className="text-slate-400 text-sm mt-1">Configure real-time event notifications.</p>
                 </div>
                 <button onClick={() => setShowWebhookModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
                    <Plus size={18} /> Add Endpoint
                 </button>
              </div>

              <div className="space-y-4">
                 {webhooks.map(hook => (
                    <div key={hook.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 group hover:border-slate-700 transition-colors">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                <Webhook size={20} />
                             </div>
                             <div>
                                <p className="text-white font-bold font-mono text-sm">{hook.url}</p>
                                <p className="text-xs text-slate-500 mt-1">Updated {new Date().toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleTestWebhook(hook)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors">
                                Send Test Event
                             </button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                          <div>
                             <p className="text-xs font-bold text-slate-500 uppercase mb-2">Signing Secret</p>
                             <div className="flex items-center gap-2">
                                <code className="text-xs text-slate-300 font-mono bg-slate-900 px-2 py-1 rounded">whsec_••••••••••••</code>
                                <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold">Reveal</button>
                             </div>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-500 uppercase mb-2">Subscribed Events</p>
                             <div className="flex flex-wrap gap-2">
                                {hook.events.map(evt => (
                                   <span key={evt} className="text-[10px] text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-500/20 font-mono">{evt}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              {showWebhookModal && (
                 <WebhookCreationModal onClose={() => setShowWebhookModal(false)} onCreate={handleCreateWebhook} />
              )}
            </div>
         )}
         
         {/* --- DOCS TAB (EMBEDDED HUB) --- */}
         {activeTab === 'DOCS' && (
            <div className="h-full flex flex-col animate-fade-in bg-[#0f172a] absolute inset-0">
               {!isDocsOpen ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0b1120]">
                     <div className="bg-slate-800/50 inline-block p-6 rounded-3xl mb-6 shadow-2xl">
                        <Code size={64} className="text-indigo-400" />
                     </div>
                     <h2 className="text-4xl font-bold text-white mb-4">Klastech Developer Hub</h2>
                     <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                        Access comprehensive guides, API references, and SDKs to build the next generation of financial products on Klastech.
                     </p>
                     <div className="flex gap-4">
                        <button 
                           onClick={() => setIsDocsOpen(true)}
                           className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                           <Book size={20} /> Open Documentation
                        </button>
                        <button className="px-8 py-4 rounded-xl font-bold text-white border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2">
                           <Globe size={20} /> View SDKs
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="flex h-full">
                     {/* Docs Sidebar */}
                     <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
                        <div className="p-4 border-b border-slate-800">
                           <button 
                              onClick={() => setIsDocsOpen(false)}
                              className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors"
                           >
                              <ChevronLeft size={16} /> Back to Portal
                           </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                           <p className="px-3 text-[10px] font-bold text-slate-500 uppercase mb-2">Getting Started</p>
                           <DocLink active={docSection === 'intro'} onClick={() => setDocSection('intro')} label="Introduction" icon={<Book size={16} />} />
                           <DocLink active={docSection === 'auth'} onClick={() => setDocSection('auth')} label="Authentication" icon={<Lock size={16} />} />
                           
                           <p className="px-3 text-[10px] font-bold text-slate-500 uppercase mt-6 mb-2">Core Resources</p>
                           <DocLink active={docSection === 'wallets'} onClick={() => setDocSection('wallets')} label="Wallets & Balances" icon={<FileText size={16} />} />
                           <DocLink active={docSection === 'webhooks'} onClick={() => setDocSection('webhooks')} label="Webhooks" icon={<Hash size={16} />} />
                        </div>
                     </div>

                     {/* Docs Content */}
                     <div className="flex-1 bg-[#0b1120] overflow-y-auto p-8 md:p-12">
                        <div className="max-w-3xl mx-auto space-y-12">
                           {docSection === 'intro' && (
                              <div className="space-y-6 animate-fade-in">
                                 <div>
                                    <h1 className="text-4xl font-bold text-white mb-4">Introduction to Klastech API</h1>
                                    <p className="text-slate-400 text-lg leading-relaxed">
                                       The Klastech API provides programmatic access to financial infrastructure for Africa. You can use our API to access Klastech wallet functionality, process payments, and manage P2P trades.
                                    </p>
                                 </div>
                                 <div className="bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-r-xl">
                                    <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-2"><Server size={18} /> Base URL</h4>
                                    <p className="text-slate-300 font-mono">https://api.klastech.pro/v1</p>
                                 </div>
                              </div>
                           )}

                           {docSection === 'auth' && (
                              <div className="space-y-6 animate-fade-in">
                                 <h1 className="text-4xl font-bold text-white mb-4">Authentication</h1>
                                 <p className="text-slate-400 leading-relaxed">
                                    Authenticate your API requests using your API keys. You can manage your keys in the <strong>API Keys</strong> tab of this portal.
                                 </p>
                                 <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                                       <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                       <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                       <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                       <span className="text-xs text-slate-500 font-mono ml-2">bash</span>
                                    </div>
                                    <div className="p-6 overflow-x-auto">
                                       <pre className="font-mono text-sm text-indigo-300">
{`curl https://api.klastech.pro/v1/wallets \\
  -H "Authorization: Bearer pk_live_123456789" \\
  -H "Content-Type: application/json"`}
                                       </pre>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {docSection === 'wallets' && (
                              <div className="space-y-6 animate-fade-in">
                                 <h1 className="text-4xl font-bold text-white mb-4">Wallets</h1>
                                 <p className="text-slate-400 leading-relaxed">
                                    Retrieve balance information and asset lists for a connected user.
                                 </p>
                                 <h3 className="text-xl font-bold text-white pt-4">Get Balance</h3>
                                 <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-3">
                                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded font-bold text-xs border border-emerald-500/20">GET</span>
                                    <span className="text-slate-300 font-mono text-sm">/v1/wallets/{`{id}`}</span>
                                 </div>
                              </div>
                           )}

                           {docSection === 'webhooks' && (
                              <div className="space-y-6 animate-fade-in">
                                 <h1 className="text-4xl font-bold text-white mb-4">Webhooks</h1>
                                 <p className="text-slate-400 leading-relaxed">
                                    Listen for real-time events like payments and order updates. We sign every request so you can verify its authenticity.
                                 </p>
                                 <h3 className="text-xl font-bold text-white pt-4">Verifying Signatures</h3>
                                 <p className="text-slate-400 text-sm">
                                    Verify the <code className="bg-slate-800 px-1 rounded">X-Klastech-Signature</code> header using your webhook secret.
                                 </p>
                                 <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono">Node.js Example</div>
                                    <div className="p-6 overflow-x-auto">
                                       <pre className="font-mono text-sm text-emerald-300">
{`const crypto = require('crypto');

const sig = req.headers['x-klastech-signature'];
const hmac = crypto.createHmac('sha256', endpointSecret);
const digest = hmac.update(req.body).digest('hex');

if (sig === digest) {
  // Verified!
}`}
                                       </pre>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         )}

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const KeyCreationModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (label: string, scopes: ApiScope[], ips: string) => void }) => {
  const [label, setLabel] = useState('');
  const [scopes, setScopes] = useState<ApiScope[]>(['wallets:read']);
  const [ips, setIps] = useState('');
  
  const toggleScope = (scope: ApiScope) => {
    if(scopes.includes(scope)) setScopes(scopes.filter(s => s !== scope));
    else setScopes([...scopes, scope]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
       <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
             <h3 className="text-lg font-bold text-white">Create API Key</h3>
             <button onClick={onClose}><Trash2 size={20} className="text-slate-500" /></button>
          </div>
          <div className="p-6 space-y-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name</label>
                <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. Production Server" />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Scopes</label>
                <div className="grid grid-cols-2 gap-3">
                   {['wallets:read', 'trade:execute', 'transfers:write', 'webhooks:manage'].map((s: any) => (
                      <div key={s} onClick={() => toggleScope(s)} className={`p-3 rounded-lg border cursor-pointer transition-all ${scopes.includes(s) ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                         <p className="text-xs font-bold">{s}</p>
                      </div>
                   ))}
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">IP Whitelist (Optional)</label>
                <input type="text" value={ips} onChange={(e) => setIps(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500 font-mono text-sm" placeholder="192.168.1.1/32" />
             </div>
             <button onClick={() => onCreate(label, scopes, ips)} disabled={!label} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-2 disabled:opacity-50">Create Key</button>
          </div>
       </div>
    </div>
  )
}

const WebhookCreationModal = ({ onClose, onCreate }: { onClose: () => void, onCreate: (url: string, events: string[]) => void }) => {
   const [url, setUrl] = useState('');
   
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
           <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add Webhook Endpoint</h3>
              <button onClick={onClose}><Trash2 size={20} className="text-slate-500" /></button>
           </div>
           <div className="p-6 space-y-4">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Endpoint URL</label>
                 <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="https://api.yourapp.com/webhooks" />
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                 <p className="text-xs text-slate-400">Events to send:</p>
                 <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">payment.success</span>
                    <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">p2p.order_created</span>
                 </div>
              </div>
              <button onClick={() => onCreate(url, ['payment.success', 'p2p.order_created'])} disabled={!url} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-2 disabled:opacity-50">Add Endpoint</button>
           </div>
        </div>
     </div>
   )
 }

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const DocLink = ({ active, onClick, label, icon }: any) => (
  <button 
     onClick={onClick}
     className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
  >
     {icon} {label}
  </button>
);

const MetricCard = ({ label, value, change, icon }: any) => (
  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
     <div className="flex justify-between items-start mb-2">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">{label}</span>
        {icon}
     </div>
     <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className={`text-xs font-bold mb-1 ${change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{change}</span>
     </div>
  </div>
);