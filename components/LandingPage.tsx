
import React, { useState } from 'react';
import { 
  Globe, ShieldCheck, Zap, ArrowRight, CheckCircle2, 
  ChevronRight, Layers, MessageSquare, 
  Lock, Landmark, Server, Users, DollarSign, RefreshCw, X, Shield, Cpu, Mail
} from 'lucide-react';
import { ExpressionOfInterest } from '../types';

interface LandingPageProps {
  onEnterRetailApp: () => void;
  onSubmitEOI: (data: ExpressionOfInterest) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterRetailApp, onSubmitEOI }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<string>('General Inquiry');
  
  const [formData, setFormData] = useState<ExpressionOfInterest>({
    fullName: '',
    workEmail: '',
    companyName: '',
    businessType: 'FINTECH',
    monthlyVolume: '< $100K',
    interest: [],
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openForm = (context: string) => {
    setModalContext(context);
    setIsModalOpen(true);
    setSubmitted(false);
  };

  const handleToggleInterest = (item: any) => {
    setFormData(prev => ({
      ...prev,
      interest: prev.interest.includes(item) 
        ? prev.interest.filter(i => i !== item) 
        : [...prev.interest, item]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitEOI({ ...formData, additionalInfo: `Context: ${modalContext}` });
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        if (!isSubmitting) setIsModalOpen(false);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30 font-inter scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
              K
            </div>
            <span className="text-xl font-bold tracking-tight">Klastech <span className="text-cyan-400 font-medium">Enterprise</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#solutions" className="hover:text-white transition-colors">Infrastructure</a>
            <a href="#liquidity" className="hover:text-white transition-colors">Liquidity</a>
            <a href="#compliance" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onEnterRetailApp}
              className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              Core Platform
            </button>
            <button 
              onClick={() => openForm('Navigation: Request Access')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              Partner With Us <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-6 animate-fade-in">
              <Zap size={12} className="fill-cyan-400" /> INSTITUTIONAL CORE BANKING AS A SERVICE
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 animate-fade-in tracking-tight">
              Enterprise Web3 Infrastructure for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Modern Markets.</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              We provide deep USDC/NGN liquidity pools and white-label core banking rails for regulated fintechs, merchants, and international institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <button 
                onClick={() => openForm('Hero: Acquire White-Label')}
                className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
              >
                Acquire White-Label Solution
              </button>
              <button 
                onClick={() => openForm('Hero: Access USDC Pool')}
                className="px-8 py-4 bg-slate-900 border border-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Access USDC Liquidity <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section id="compliance" className="px-6 py-12 border-y border-slate-800/50 bg-slate-950/30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-2 font-bold text-xl"><Landmark size={24} /> TIER-1 BANKING</div>
           <div className="flex items-center gap-2 font-bold text-xl"><Globe size={24} /> GLOBAL SETTLEMENT</div>
           <div className="flex items-center gap-2 font-bold text-xl"><ShieldCheck size={24} /> ISO 27001 COMPLIANT</div>
           <div className="flex items-center gap-2 font-bold text-xl"><Server size={24} /> MPC CUSTODY</div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Regulated Infrastructure</h2>
            <p className="text-slate-400 text-lg">Industrial-strength financial tools designed for scalability and trust.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layers className="text-cyan-400" />}
              title="White-Label Core"
              desc="Deploy a fully branded, regulated digital bank. Modular ledger and wallet architecture included."
              onClick={() => openForm('Feature: White-Label Core')}
            />
            <FeatureCard 
              icon={<RefreshCw className="text-blue-400" />}
              title="Institutional Liquidity"
              desc="Deep pools for USDC and NGN. Access institutional rates with automated market making (AMM) rails."
              onClick={() => openForm('Feature: Institutional Liquidity')}
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-400" />}
              title="Regulatory Shield"
              desc="Automated KYC/AML, Travel Rule compliance, and real-time transaction monitoring as a service."
              onClick={() => openForm('Feature: Regulatory Shield')}
            />
          </div>
        </div>
      </section>

      {/* USDC Pool Focus */}
      <section id="liquidity" className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 rounded-[40px] border border-slate-800 p-8 md:p-16 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                 <h2 className="text-4xl font-bold mb-6 text-white leading-tight">Secure Global USD Rails</h2>
                 <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Move funds across borders with same-day settlement. Klastech provides deep liquidity for high-volume transactions up to $10M.
                 </p>
                 <div className="space-y-4 mb-10">
                    {["Instant fiat on/off-ramps", "Enterprise-grade asset security", "Global SWIFT/SEPA settlement"].map(item => (
                      <div key={item} className="flex items-center gap-3 text-slate-300 font-medium">
                        <CheckCircle2 className="text-cyan-500" size={20} /> {item}
                      </div>
                    ))}
                 </div>
                 <button 
                  onClick={() => openForm('Section: Liquidity Pool Request')}
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold shadow-lg shadow-cyan-500/20 transition-all"
                 >
                    Access Liquidity Pool
                 </button>
              </div>
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exchange Status</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> OPERATIONAL
                    </span>
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                       <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Trading Pair</p>
                          <p className="text-xl font-bold text-white">USDC / NGN</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs text-slate-500 uppercase font-bold">Market Price</p>
                          <p className="text-xl font-bold text-cyan-400">₦1,550.00</p>
                       </div>
                    </div>
                    <div className="pt-4">
                       <button 
                        onClick={() => openForm('Section: USDC Rate Card')}
                        className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                       >
                          View Institutional Rates
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* EOI Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-md animate-fade-in">
           <div className="bg-slate-900 w-full max-w-2xl rounded-[40px] border border-slate-800 shadow-3xl overflow-hidden relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10 p-2"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-1/3 bg-slate-950 p-10 flex flex-col justify-between border-r border-slate-800">
                  <div>
                    <div className="w-12 h-12 bg-cyan-600/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">
                      <Cpu size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Enterprise Onboarding</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Connect with our institutional team to discuss custom digital asset rails.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                         <Shield size={14} className="text-cyan-500" /> SOC 2 Type II Certified
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                         <Globe size={14} className="text-cyan-500" /> Multi-region Support
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-slate-900 pt-6">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Inquiry Route</p>
                    <p className="text-xs text-slate-500 font-medium">{modalContext}</p>
                  </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto max-h-[85vh] custom-scrollbar">
                  {submitted ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-fade-in">
                       <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
                          <CheckCircle2 size={40} />
                       </div>
                       <h3 className="text-3xl font-bold text-white mb-4">Interest Recorded</h3>
                       <p className="text-slate-400">An institutional lead will reach out to <strong>{formData.workEmail}</strong> within 24 hours.</p>
                       <div className="mt-8 pt-6 border-t border-slate-800 w-full">
                          <p className="text-xs text-slate-500 mb-2">Urgent Inquiry?</p>
                          <a href="mailto:contact@klastech.pro" className="text-cyan-400 font-bold hover:underline">contact@klastech.pro</a>
                       </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                             <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="Alex Thompson" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Work Email</label>
                             <input required type="email" value={formData.workEmail} onChange={e => setFormData({...formData, workEmail: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="alex@fintech.com" />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organization Name</label>
                          <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none" placeholder="Corporate Holdings LLC" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector</label>
                             <select value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500">
                                <option value="FINTECH">Fintech / Neo-bank</option>
                                <option value="FX_MERCHANT">Liquidity / FX Merchant</option>
                                <option value="INSTITUTIONAL_INVESTOR">Hedge Fund / Fund</option>
                                <option value="OTHER">Other Enterprise</option>
                             </select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Volume (Monthly)</label>
                             <select value={formData.monthlyVolume} onChange={e => setFormData({...formData, monthlyVolume: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500">
                                <option value="< $100K">{"< $100K"}</option>
                                <option value="$100K - $1M">$100K - $1M</option>
                                <option value="$1M - $10M">$1M - $10M</option>
                                <option value="$10M+">$10M+</option>
                             </select>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Infrastructure Needs</label>
                          <div className="flex flex-wrap gap-2">
                             <InterestBtn active={formData.interest.includes('WHITE_LABEL')} onClick={() => handleToggleInterest('WHITE_LABEL')} label="White-Label" />
                             <InterestBtn active={formData.interest.includes('USDC_LIQUIDITY')} onClick={() => handleToggleInterest('USDC_LIQUIDITY')} label="Liquidity Pool" />
                             <InterestBtn active={formData.interest.includes('API_INFRASTRUCTURE')} onClick={() => handleToggleInterest('API_INFRASTRUCTURE')} label="Core API" />
                             <InterestBtn active={formData.interest.includes('TREASURY_MANAGEMENT')} onClick={() => handleToggleInterest('TREASURY_MANAGEMENT')} label="Treasury" />
                          </div>
                       </div>
                       <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                       >
                         {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Submit Expression of Interest"}
                       </button>
                    </form>
                  )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-sm">K</div>
              <span className="font-bold text-slate-300">Klastech Enterprise</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-500 text-sm hover:text-cyan-400 transition-colors">
                <Mail size={16} />
                <a href="mailto:contact@klastech.pro">contact@klastech.pro</a>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Globe size={16} />
                <span>Operating Globally</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
             <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Infrastructure</p>
                <div className="flex flex-col gap-2">
                   <button onClick={() => openForm('Footer: Core Ledger')} className="text-sm text-slate-400 hover:text-white text-left">Core Ledger</button>
                   <button onClick={() => openForm('Footer: API Hub')} className="text-sm text-slate-400 hover:text-white text-left">API Hub</button>
                   <button onClick={() => openForm('Footer: Custody')} className="text-sm text-slate-400 hover:text-white text-left">MPC Custody</button>
                </div>
             </div>
             <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Solutions</p>
                <div className="flex flex-col gap-2">
                   <button onClick={() => openForm('Footer: White Label')} className="text-sm text-slate-400 hover:text-white text-left">White-Label</button>
                   <button onClick={() => openForm('Footer: Liquidity Pool')} className="text-sm text-slate-400 hover:text-white text-left">Liquidity Pools</button>
                   <button onClick={() => openForm('Footer: Treasury')} className="text-sm text-slate-400 hover:text-white text-left">Treasury</button>
                </div>
             </div>
             <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Company</p>
                <div className="flex flex-col gap-2">
                   <button onClick={onEnterRetailApp} className="text-sm text-slate-400 hover:text-white text-left">Retail App</button>
                   <button onClick={() => openForm('Footer: Compliance')} className="text-sm text-slate-400 hover:text-white text-left">Compliance</button>
                   <a href="https://klastech.pro" className="text-sm text-slate-400 hover:text-white">Main Site</a>
                </div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between gap-4">
           <p className="text-slate-600 text-xs">© 2024 Klastech Digital Solutions Ltd. Registered RC-8963984. ISO 27001 Certified Architecture.</p>
           <div className="flex gap-6">
              <button onClick={() => openForm('Footer: Privacy')} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</button>
              <button onClick={() => openForm('Footer: Terms')} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms of Service</button>
           </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) => (
  <div onClick={onClick} className="p-8 rounded-[32px] bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all group cursor-pointer h-full">
    <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-slate-800">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
       Request Integration <ArrowRight size={12} />
    </div>
  </div>
);

const InterestBtn = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    type="button" 
    onClick={onClick} 
    className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-tight transition-all ${active ? 'bg-cyan-600/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
  >
    {label}
  </button>
);
