import React, { useState } from 'react';
import { BuilderDashboard } from './components/BuilderDashboard';
import { store } from './services/mockStore';
import { Lock, ArrowRight, ShieldCheck, User, Building, ChevronLeft, LayoutGrid } from 'lucide-react';

type ViewState = 'landing' | 'builder-login' | 'builder-dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper to handle view transitions
  const navigateTo = (newView: ViewState) => {
    setIsAnimating(true);
    setTimeout(() => {
      setView(newView);
      setIsAnimating(false);
    }, 300);
  };

  // Login Handlers
  const handleBuilderLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('builder-dashboard');
  };

  // Views that take over the full screen
  if (view === 'builder-dashboard') {
    return <BuilderDashboard />;
  }

  const BG_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans text-slate-100">

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img src={BG_IMAGE} alt="Background" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_70%)]" />
      </div>

      {/* Main Content Container */}
      <div className={`z-10 w-full max-w-5xl px-6 transition-all duration-300 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

        {/* Header Branding */}
        <div className={`text-center mb-12 transition-all duration-500 ${view !== 'landing' ? 'mb-8 scale-90' : ''}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-6 shadow-2xl shadow-blue-500/20">
            <LayoutGrid className="text-white w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
            Risewith<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">9</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
            Real Estate Sales & Virtual Inventory Management System
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex justify-center">

          {/* LANDING PAGE - Dedicated to Builder Access */}
          {view === 'landing' && (
            <div className="w-full max-w-2xl">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-48 bg-blue-500/10 rounded-full blur-[100px] -mr-24 -mt-24"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Building size={32} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Builder Management Portal</h2>
                  <p className="text-slate-400 text-lg mb-10 max-w-md">
                    Control unit availability, monitor buyer engagement, and host live sessions from a centralized dashboard.
                  </p>

                  <button
                    onClick={() => navigateTo('builder-login')}
                    className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transform active:scale-95"
                  >
                    Login to Console <ArrowRight size={20} />
                  </button>

                  <div className="mt-8 flex gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">520+</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Units Managed</p>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">12k</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Buyer Tours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BUILDER LOGIN FORM */}
          {view === 'builder-login' && (
            <div className="w-full max-w-md">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <button
                  onClick={() => navigateTo('landing')}
                  className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                  <ChevronLeft size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Builder Authentication</h2>
                <p className="text-slate-400 mb-8">Secure access to project data</p>

                <form onSubmit={handleBuilderLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Administrator Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-slate-500">
                        <User size={18} />
                      </div>
                      <input
                        type="email"
                        defaultValue="admin@risewith9.com"
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                        placeholder="admin@risewith9.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Security Key</label>
                    <div className="relative">
                      <div className="absolute left-4 top-3.5 text-slate-500">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        defaultValue="password"
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 transform active:scale-95 mt-4"
                  >
                    Enter Builder Console
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">Enterprise Security • Risewith9 System</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 flex items-center gap-2 text-slate-600 text-[10px] font-bold tracking-[0.3em] uppercase z-10">
        <ShieldCheck size={12} className="text-blue-500/50" />
        Encrypted Portal Access
      </div>
    </div>
  );
};

export default App;