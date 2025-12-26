
import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Key, BarChart3, Lock, Unlock,
  Video, Plus, CheckCircle, RefreshCw, Layers, Menu, Eye, X, Sparkles,
  ArrowLeft, UserPlus, Mail, Phone, User, Copy, ExternalLink, PartyPopper
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { store, MOCK_ANALYTICS } from '../services/mockStore';
import { generateUnitDescription, generateAnalyticsInsight } from '../services/geminiService';
import { Unit, UnitStatus, Buyer, AccessCode } from '../types';

// Image Imports
import tnCorridor from '../assets/images/9 north/TN_Corridor.PNG';
import tnU1 from '../assets/images/9 north/TN_U1.PNG';
import tnU2 from '../assets/images/9 north/TN_U2.PNG';
import tnU3 from '../assets/images/9 north/TN_U3.PNG';
import tnU4 from '../assets/images/9 north/TN_U4.PNG';

import tsCorridor from '../assets/images/9 south/TS_Corridor.PNG';
import tsU1 from '../assets/images/9 south/TS_U1.PNG';
import tsU2 from '../assets/images/9 south/TS_U2.PNG';
import tsU3 from '../assets/images/9 south/TS_U3.PNG';
import tsU4 from '../assets/images/9 south/TS_U4.PNG';

import floorBtnBg from '../assets/images/FloorSelection_Button.PNG';


export const BuilderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'buyers' | 'analytics'>('projects');
  const [units, setUnits] = useState<Unit[]>(store.getUnits());
  const [buyers, setBuyers] = useState<Buyer[]>(store.getBuyers());
  const [codes, setCodes] = useState<AccessCode[]>(store.getCodes());
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // New Buyer State
  const [isCreatingBuyer, setIsCreatingBuyer] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState("");
  const [newBuyerEmail, setNewBuyerEmail] = useState("");
  const [newBuyerPhone, setNewBuyerPhone] = useState("");
  const [selectedUnitForBuyer, setSelectedUnitForBuyer] = useState<Unit | null>(null);

  // Issue Key State
  const [issuingBuyer, setIssuingBuyer] = useState<Buyer | null>(null);
  const [generatedAccessCode, setGeneratedAccessCode] = useState<AccessCode | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Inventory State
  const [selectedFloor, setSelectedFloor] = useState(3);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Handlers
  const handleToggleLock = (id: string, status?: UnitStatus) => {
    setUnits(store.toggleUnitStatus(id, status));
    setSelectedUnit(null);
  };

  const handleIssueKey = (buyer: Buyer) => {
    if (!buyer.assignedUnitId) {
      alert("This buyer does not have an assigned unit yet.");
      return;
    }
    const codeObj = store.generateCode(buyer.id, buyer.assignedUnitId);
    setGeneratedAccessCode(codeObj);
    setIssuingBuyer(buyer);
    setCodes(store.getCodes());
  };

  const closeIssueModal = () => {
    setIssuingBuyer(null);
    setGeneratedAccessCode(null);
    setCopyFeedback(false);
  };

  const getShareMessage = () => {
    if (!issuingBuyer || !generatedAccessCode) return "";
    const unit = units.find(u => u.id === issuingBuyer.assignedUnitId);
    return `Hello ${issuingBuyer.name},

Welcome to Trilight - Rise with 9! 

Flat Details:
- Tower: ${unit?.tower}
- Floor: ${unit?.floor}
- Unit: ${unit?.number}

Join your tour here:
https://risewith9.com/explore/${generatedAccessCode.code}`;
  };

  const copyToClipboard = () => {
    const text = getShareMessage();
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleAddBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyerName || !newBuyerEmail || !selectedUnitForBuyer) {
      alert("Please fill name, email and select a unit.");
      return;
    }

    const newBuyer: Buyer = {
      id: `b${Date.now()}`,
      name: newBuyerName,
      email: newBuyerEmail,
      phone: newBuyerPhone || 'N/A',
      assignedUnitId: selectedUnitForBuyer.id
    };

    const updatedBuyers = store.addBuyer(newBuyer);
    setBuyers(updatedBuyers);

    // Reset and return
    setIsCreatingBuyer(false);
    setNewBuyerName("");
    setNewBuyerEmail("");
    setNewBuyerPhone("");
    setSelectedUnitForBuyer(null);
  };

  const fetchAiInsight = async () => {
    setLoadingAi(true);
    const insight = await generateAnalyticsInsight(MOCK_ANALYTICS);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAiInsight();
    }
  }, [activeTab]);

  const getUnit = (tower: string, floor: number, homeNum: number) => {
    return units.find(u => u.tower === tower && u.floor === floor && u.number === `Home ${homeNum}`);
  };

  // Blueprint-style unit component with Image Support
  const HomeBlueprint = ({ tower, homeNum, isSelectionMode, imgSrc }: { tower: string, homeNum: number, isSelectionMode?: boolean, imgSrc: string }) => {
    const unit = getUnit(tower, selectedFloor, homeNum);
    if (!unit) return null;

    const isSold = unit.status === UnitStatus.SOLD;
    const isActive = (selectedUnitForBuyer?.id === unit.id) || (selectedUnit?.id === unit.id);

    const handleClick = () => {
      if (isSelectionMode) {
        setSelectedUnitForBuyer(unit);
      } else {
        setSelectedUnit(unit);
      }
    };

    return (
      <div
        onClick={handleClick}
        className={`relative cursor-pointer transition-all duration-300 flex items-center justify-center w-1/2 overflow-hidden group outline-none
          ${isActive ? 'z-10 border-2 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'border border-transparent'}
          ${isSold ? 'opacity-40 grayscale' : 'hover:brightness-125'}`}
      >
        <img src={imgSrc} alt={`${tower} Unit ${homeNum}`} className="w-full h-auto object-cover block scale-[1.02]" />

        {/* Unit Label Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-medium text-white/70 tracking-wide">
            Home {homeNum}
          </span>
        </div>

        {isActive && (
          <div className="absolute top-1 right-1">
            <CheckCircle size={10} className="text-red-500 drop-shadow-md bg-white rounded-full" />
          </div>
        )}
      </div>
    );
  };

  const renderFloorRow = (start: number, end: number) => (
    <div className="flex justify-center gap-2 mb-2 flex-nowrap">
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(floor => (
        <button
          key={floor}
          onClick={() => setSelectedFloor(floor)}
          className={`w-[50px] h-[50px] flex items-center justify-center text-sm font-bold transition-all duration-200 rounded-lg bg-transparent
            ${selectedFloor === floor
              ? 'text-white border-2 border-red-600'
              : 'text-slate-200 hover:text-white border-2 border-white/80'}
          `}
        >
          {floor}
        </button>
      ))}
    </div>
  );

  // Common Tower UI Component
  const TowerLayout = ({ isSelectionMode }: { isSelectionMode?: boolean }) => (
    <div className="z-10 w-full flex flex-col items-center justify-start pt-8 h-full">

      {/* Towers Container */}
      <div className="flex justify-center items-start gap-24 mb-4 w-full px-8">

        {/* 9 South */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl text-slate-200 mb-6 tracking-widest uppercase font-light">9 South</h3>
          <div className="flex flex-col items-center w-[280px] border-2 border-white/60 p-3">
            <div className="flex w-full">
              <HomeBlueprint tower="9 South" homeNum={3} isSelectionMode={isSelectionMode} imgSrc={tsU3} />
              <HomeBlueprint tower="9 South" homeNum={4} isSelectionMode={isSelectionMode} imgSrc={tsU4} />
            </div>
            <img src={tsCorridor} alt="Corridor" className="w-full h-auto block select-none my-1" />
            <div className="flex w-full">
              <HomeBlueprint tower="9 South" homeNum={2} isSelectionMode={isSelectionMode} imgSrc={tsU2} />
              <HomeBlueprint tower="9 South" homeNum={1} isSelectionMode={isSelectionMode} imgSrc={tsU1} />
            </div>
          </div>
        </div>

        {/* 9 North */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl text-slate-200 mb-6 tracking-widest uppercase font-light">9 North</h3>
          <div className="flex flex-col items-center w-[280px] border-2 border-white/60 p-3">
            <div className="flex w-full">
              <HomeBlueprint tower="9 North" homeNum={3} isSelectionMode={isSelectionMode} imgSrc={tnU3} />
              <HomeBlueprint tower="9 North" homeNum={4} isSelectionMode={isSelectionMode} imgSrc={tnU4} />
            </div>
            <img src={tnCorridor} alt="Corridor" className="w-full h-auto block select-none my-1" />
            <div className="flex w-full">
              <HomeBlueprint tower="9 North" homeNum={2} isSelectionMode={isSelectionMode} imgSrc={tnU2} />
              <HomeBlueprint tower="9 North" homeNum={1} isSelectionMode={isSelectionMode} imgSrc={tnU1} />
            </div>
          </div>
        </div>

      </div>

      {/* Floor Matrix (Keyboard Style) */}
      <div className="w-full max-w-[1600px] mt-auto mb-16 px-4 flex flex-col items-center gap-1">
        {renderFloorRow(1, 20)}
        {renderFloorRow(21, 40)}
        {renderFloorRow(41, 55)}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-slate-100 overflow-hidden font-sans">
      <aside className="w-20 bg-black/80 backdrop-blur-3xl border-r border-white/5 flex flex-col z-40 items-center py-8 gap-10">
        {/* Removed Layers Icon */}

        <nav className="flex flex-col gap-8">
          <button onClick={() => { setActiveTab('projects'); setIsCreatingBuyer(false); }} className={`p-3 rounded-xl transition-all ${activeTab === 'projects' && !isCreatingBuyer ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}><Building2 size={24} /></button>
          <button onClick={() => { setActiveTab('buyers'); setIsCreatingBuyer(false); }} className={`p-3 rounded-xl transition-all ${activeTab === 'buyers' || isCreatingBuyer ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}><Users size={24} /></button>
          <button onClick={() => { setActiveTab('analytics'); setIsCreatingBuyer(false); }} className={`p-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}><BarChart3 size={24} /></button>
        </nav>
      </aside>

      <main className="flex-1 overflow-hidden relative">

        {/* Project View - Floor Management */}
        {activeTab === 'projects' && !isCreatingBuyer && (
          <div className="h-full w-full relative flex flex-col items-center justify-center p-6">
            <div className="absolute inset-0 z-0 bg-[#08213D] transition-colors duration-1000"></div>

            {/* Header Text Removed */}

            <TowerLayout />

            {selectedUnit && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-in fade-in">
                <div className="relative bg-zinc-900 border border-white/10 w-full max-w-lg p-10 rounded-[3rem] shadow-4xl transform animate-in zoom-in-95">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.4em] mb-4">{selectedUnit.tower} • Floor {selectedUnit.floor}</p>
                      <h3 className="text-4xl font-bold tracking-tight text-white">{selectedUnit.number}</h3>
                    </div>
                    <button onClick={() => setSelectedUnit(null)} className="p-3 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="p-5 bg-white/5 rounded-[1.5rem]">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Configuration</p>
                      <p className="text-xl font-bold text-white">{selectedUnit.type}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-[1.5rem]">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">Price Guide</p>
                      <p className="text-xl font-bold text-white">{selectedUnit.price}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => handleToggleLock(selectedUnit.id, UnitStatus.AVAILABLE)} className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${selectedUnit.status === UnitStatus.AVAILABLE ? 'bg-white text-black' : 'bg-zinc-800 text-slate-400 hover:bg-zinc-700'}`}>Available</button>
                    <button onClick={() => handleToggleLock(selectedUnit.id, UnitStatus.SOLD)} className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${selectedUnit.status === UnitStatus.SOLD ? 'bg-red-600 text-white' : 'bg-zinc-800 text-slate-400 hover:bg-red-900/30'}`}>Mark as Sold</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buyer Registry List View */}
        {activeTab === 'buyers' && !isCreatingBuyer && (
          <div className="h-full overflow-y-auto p-12 bg-black">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold mb-1 tracking-tight">Buyer Registry</h2>
                <p className="text-slate-500 text-sm font-light">Client management and tour delegation.</p>
              </div>
              <button
                onClick={() => setIsCreatingBuyer(true)}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all shadow-xl flex items-center gap-2"
              >
                <UserPlus size={16} /> Create New Buyer
              </button>
            </header>
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
              <table className="w-full text-left">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-500">Client Info</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-500">Asset Interest</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {buyers.map(buyer => (
                    <tr key={buyer.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-white text-lg">{buyer.name}</p>
                        <p className="text-xs text-slate-500">{buyer.email}</p>
                      </td>
                      <td className="px-8 py-6 text-slate-300 font-medium text-sm">{buyer.assignedUnitId || 'Unassigned'}</td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleIssueKey(buyer)}
                          className="bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg font-bold text-xs hover:bg-white hover:text-black transition-colors"
                        >
                          Issue Key
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Issue Key Modal - Reduced Size */}
            {issuingBuyer && generatedAccessCode && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative bg-zinc-900 border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-4xl transform animate-in zoom-in-95">
                  <button onClick={closeIssueModal} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>

                  <div className="mb-6 text-center">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 mx-auto">
                      <PartyPopper size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Key Issued</h3>
                    <p className="text-slate-400 text-sm font-light">Copy and share this invite with {issuingBuyer.name}.</p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-6 relative">
                    <p className="text-white/80 text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {getShareMessage()}
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {copyFeedback ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      {copyFeedback ? 'Copied!' : 'Copy Invite'}
                    </button>
                    <button
                      onClick={closeIssueModal}
                      className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all border border-white/5"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create New Buyer Mode */}
        {activeTab === 'buyers' && isCreatingBuyer && (
          <div className="h-full w-full relative flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 z-0">
              <img src={DASHBOARD_BG} className="w-full h-full object-cover" alt="Interior Environment" />
              <div className="absolute inset-0 bg-black/70"></div>
            </div>

            <div className="absolute top-8 left-8 z-20">
              <button
                onClick={() => setIsCreatingBuyer(false)}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                <ArrowLeft size={18} /> Back
              </button>
            </div>

            <div className="absolute top-8 right-12 text-right z-10">
              <div className="flex flex-col items-end opacity-90">
                <h4 className="text-[8px] font-bold tracking-[0.4em] uppercase text-white/50 mb-[-2px]">Registration</h4>
                <h2 className="text-lg font-light text-white leading-none">Select <span className="font-bold text-2xl italic">Asset</span></h2>
              </div>
            </div>

            <TowerLayout isSelectionMode={true} />

            <form onSubmit={handleAddBuyer} className="mt-8 w-full max-w-[1200px] flex flex-wrap items-end justify-center gap-3 bg-black/40 backdrop-blur-3xl border border-white/10 p-6 rounded-2xl shadow-4xl animate-in slide-in-from-bottom-5">
              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                  <User size={10} /> Full Name
                </label>
                <input
                  type="text"
                  value={newBuyerName}
                  onChange={(e) => setNewBuyerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-white/40"
                />
              </div>

              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                  <Mail size={10} /> Email
                </label>
                <input
                  type="email"
                  value={newBuyerEmail}
                  onChange={(e) => setNewBuyerEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-white/40"
                />
              </div>

              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                  <Phone size={10} /> Phone
                </label>
                <input
                  type="tel"
                  value={newBuyerPhone}
                  onChange={(e) => setNewBuyerPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-white/40"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-2.5 bg-white text-black rounded-lg font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50"
                disabled={!selectedUnitForBuyer}
              >
                Add Buyer
              </button>
            </form>
          </div>
        )}

        {/* Market Insights Tab */}
        {activeTab === 'analytics' && (
          <div className="h-full overflow-y-auto p-12 bg-black">
            <header className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-1">Market Insights</h2>
              <p className="text-slate-500 text-sm font-light">Advanced behavior analysis via Gemini Intelligence.</p>
            </header>
            <div className="bg-gradient-to-br from-indigo-950/30 to-blue-950/30 p-8 rounded-3xl border border-white/5 mb-8 shadow-2xl backdrop-blur-xl">
              <h3 className="text-sm font-bold text-blue-300 mb-4 flex items-center gap-2">
                <Sparkles size={18} /> AI Analysis
              </h3>
              <p className="text-white text-lg font-light leading-relaxed italic">
                "{loadingAi ? "Analyzing metadata..." : aiInsight}"
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-white/5 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_ANALYTICS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#52525b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                    <Bar dataKey="visits" fill="#fff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-zinc-900/30 p-8 rounded-2xl border border-white/5 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_ANALYTICS} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#52525b" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                    <Bar dataKey="avgTime" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
