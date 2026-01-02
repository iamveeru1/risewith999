
import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Key, BarChart3, Lock, Unlock,
  Video, Plus, CheckCircle, RefreshCw, Layers, Menu, Eye, X, Sparkles,
  UserPlus, Mail, Phone, User, Copy, ExternalLink, Edit, Trash2, LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { store, MOCK_ANALYTICS } from '../services/mockStore';
import { generateUnitDescription, generateAnalyticsInsight } from '../services/geminiService';
import {
  getAllBuyers as getAllBuyersAPI,
  createBuyer as createBuyerAPI,
  updateBuyer as updateBuyerAPI,
  deleteBuyer as deleteBuyerAPI,
  generateAccessCode as generateAccessCodeAPI
} from '../services/apiService';
import { Unit, UnitStatus, Buyer } from '../types';

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

interface BuilderDashboardProps {
  onLogout: () => void;
}

export const BuilderDashboard: React.FC<BuilderDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'buyers' | 'analytics'>('projects');
  const [units, setUnits] = useState<Unit[]>(store.getUnits());
  const [buyers, setBuyers] = useState<Buyer[]>([]); // Start with empty array, will load from API
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // New Buyer State
  const [isCreatingBuyer, setIsCreatingBuyer] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState("");
  const [newBuyerEmail, setNewBuyerEmail] = useState("");
  const [newBuyerPhone, setNewBuyerPhone] = useState("");
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);

  // View Code State
  const [viewingCodeBuyer, setViewingCodeBuyer] = useState<Buyer | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Inventory State
  const [selectedFloor, setSelectedFloor] = useState(3);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Handlers
  const handleToggleLock = (id: string, status?: UnitStatus) => {
    setUnits(store.toggleUnitStatus(id, status));
    setSelectedUnit(null);
  };

  const handleIssueKey = async (buyer: Buyer) => {
    // Call API to generate access code
    const result = await generateAccessCodeAPI(buyer.id, 60);

    if (result.success && result.data) {
      // Update buyer with the generated code and timestamp
      const updatedBuyer: Buyer = {
        ...buyer,
        accessCode: result.data.code,
        codeGeneratedAt: Date.now() // Store when code was generated
      };
      setBuyers(buyers.map(b => b.id === buyer.id ? updatedBuyer : b));
    } else {
      alert(result.error || 'Failed to generate access code. Please try again.');
    }
  };

  // Calculate remaining time for access code (60 minutes validity)
  const getRemainingTime = (buyer: Buyer): string => {
    if (!buyer.codeGeneratedAt) return '-';

    const now = Date.now();
    const elapsed = now - buyer.codeGeneratedAt;
    const totalDuration = 60 * 60 * 1000; // 60 minutes in milliseconds
    const remaining = totalDuration - elapsed;

    if (remaining <= 0) {
      return 'Expired';
    }

    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  // Check if code is expired
  const isCodeExpired = (buyer: Buyer): boolean => {
    if (!buyer.codeGeneratedAt) return true; // No code generated yet

    const now = Date.now();
    const elapsed = now - buyer.codeGeneratedAt;
    const totalDuration = 60 * 60 * 1000; // 60 minutes in milliseconds
    const remaining = totalDuration - elapsed;

    return remaining <= 0;
  };

  // Load buyers from API on mount
  useEffect(() => {
    const loadBuyers = async () => {
      const result = await getAllBuyersAPI();
      if (result.success && result.data) {
        // Convert API buyers to local format
        const apiBuyers: Buyer[] = result.data.map((buyer: any) => ({
          id: buyer._id,
          name: buyer.name,
          email: buyer.email || '',
          phone: buyer.phone,
          assignedUnitId: null,
          accessCode: undefined,
          codeGeneratedAt: undefined
        }));
        setBuyers(apiBuyers);
      }
    };
    loadBuyers();
  }, []);

  // Auto-refresh remaining times every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update remaining times
      setBuyers([...buyers]);
    }, 1000);

    return () => clearInterval(interval);
  }, [buyers]);

  const handleLogout = () => {
    onLogout();
  };

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuyerName || !newBuyerPhone) {
      alert("Please fill name and phone number.");
      return;
    }

    if (editingBuyer) {
      // Update existing buyer via API
      const result = await updateBuyerAPI(editingBuyer.id, newBuyerName, newBuyerEmail, newBuyerPhone);

      if (result.success && result.data) {
        // Update buyer in state
        const updatedBuyer: Buyer = {
          ...editingBuyer,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone
        };
        setBuyers(buyers.map(b => b.id === editingBuyer.id ? updatedBuyer : b));
        setEditingBuyer(null);
      } else {
        alert(result.error || 'Failed to update buyer. Please try again.');
        return;
      }
    } else {
      // Create new buyer via API
      const result = await createBuyerAPI(newBuyerName, newBuyerEmail, newBuyerPhone);

      if (result.success && result.data) {
        // Add buyer to state
        const newBuyer: Buyer = {
          id: result.data._id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          assignedUnitId: null
        };
        setBuyers([...buyers, newBuyer]);
      } else {
        alert(result.error || 'Failed to create buyer. Please try again.');
        return;
      }
    }

    // Reset and close modal
    setIsCreatingBuyer(false);
    setNewBuyerName("");
    setNewBuyerEmail("");
    setNewBuyerPhone("");
  };

  const handleEditBuyer = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setNewBuyerName(buyer.name);
    setNewBuyerEmail(buyer.email);
    setNewBuyerPhone(buyer.phone);
    setIsCreatingBuyer(true);
  };

  const handleDeleteBuyer = async (buyerId: string) => {
    if (confirm("Are you sure you want to delete this buyer?")) {
      const result = await deleteBuyerAPI(buyerId);

      if (result.success) {
        // Remove buyer from state
        setBuyers(buyers.filter(b => b.id !== buyerId));
      } else {
        alert(result.error || 'Failed to delete buyer. Please try again.');
      }
    }
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
  const HomeBlueprint = ({ tower, homeNum, imgSrc }: { tower: string, homeNum: number, imgSrc: string }) => {
    const unit = getUnit(tower, selectedFloor, homeNum);
    if (!unit) return null;

    const isSold = unit.status === UnitStatus.SOLD;
    const isActive = selectedUnit?.id === unit.id;

    const handleClick = () => {
      setSelectedUnit(unit);
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
  const TowerLayout = () => (
    <div className="z-10 w-full flex flex-col items-center justify-start pt-8 h-full">

      {/* Towers Container */}
      <div className="flex justify-center items-start gap-24 mb-4 w-full px-8">

        {/* 9 South */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl text-slate-200 mb-6 tracking-widest uppercase font-light">9 South</h3>
          <div className="flex flex-col items-center w-[280px] border-2 border-white/60 p-3">
            <div className="flex w-full">
              <HomeBlueprint tower="9 South" homeNum={3} imgSrc={tsU3} />
              <HomeBlueprint tower="9 South" homeNum={4} imgSrc={tsU4} />
            </div>
            <img src={tsCorridor} alt="Corridor" className="w-full h-auto block select-none my-1" />
            <div className="flex w-full">
              <HomeBlueprint tower="9 South" homeNum={2} imgSrc={tsU2} />
              <HomeBlueprint tower="9 South" homeNum={1} imgSrc={tsU1} />
            </div>
          </div>
        </div>

        {/* 9 North */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl text-slate-200 mb-6 tracking-widest uppercase font-light">9 North</h3>
          <div className="flex flex-col items-center w-[280px] border-2 border-white/60 p-3">
            <div className="flex w-full">
              <HomeBlueprint tower="9 North" homeNum={3} imgSrc={tnU3} />
              <HomeBlueprint tower="9 North" homeNum={4} imgSrc={tnU4} />
            </div>
            <img src={tnCorridor} alt="Corridor" className="w-full h-auto block select-none my-1" />
            <div className="flex w-full">
              <HomeBlueprint tower="9 North" homeNum={2} imgSrc={tnU2} />
              <HomeBlueprint tower="9 North" homeNum={1} imgSrc={tnU1} />
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

        {/* Logout Button at Bottom */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="p-3 rounded-xl transition-all text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
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
        {activeTab === 'buyers' && (
          <div className="h-full overflow-y-auto p-12 bg-black relative">
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
                    <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">Name</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">Email</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">Phone</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">Code</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">Share</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">Remaining Time</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {buyers.map(buyer => (
                    <tr key={buyer.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3">
                        <p className="font-semibold text-white text-sm">{buyer.name}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-slate-300 text-sm">{buyer.email}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-slate-300 text-sm">{buyer.phone}</p>
                      </td>
                      <td className="px-6 py-3">
                        {buyer.accessCode ? (
                          <span className="text-slate-300 text-sm font-mono">
                            {buyer.accessCode}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {buyer.accessCode ? (
                          <button
                            onClick={() => setViewingCodeBuyer(buyer)}
                            className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-green-500 hover:text-white transition-colors flex items-center gap-1"
                          >
                            <ExternalLink size={14} /> Share Code
                          </button>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {buyer.accessCode ? (
                          <span className={`text-sm font-medium ${getRemainingTime(buyer) === 'Expired'
                            ? 'text-red-400'
                            : getRemainingTime(buyer).startsWith('0m') || getRemainingTime(buyer).split('m')[0] < '5'
                              ? 'text-orange-400'
                              : 'text-green-400'
                            }`}>
                            {getRemainingTime(buyer)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleIssueKey(buyer)}
                            disabled={buyer.accessCode && !isCodeExpired(buyer)}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 ${buyer.accessCode && !isCodeExpired(buyer)
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white'
                              }`}
                            title={buyer.accessCode && !isCodeExpired(buyer) ? 'Key Already Issued' : 'Issue Key'}
                          >
                            <Key size={14} /> {buyer.accessCode && !isCodeExpired(buyer) ? 'Issued Key' : 'Issue Key'}
                          </button>
                          <button
                            onClick={() => handleEditBuyer(buyer)}
                            className="bg-white/5 text-slate-300 border border-white/10 p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                            title="Edit Buyer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBuyer(buyer.id)}
                            className="bg-red-500/10 text-red-400 border border-red-500/20 p-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                            title="Delete Buyer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* View Code Modal */}
            {viewingCodeBuyer && viewingCodeBuyer.accessCode && (
              <div className="fixed top-0 right-0 bottom-0 left-20 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative bg-zinc-900 border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-4xl transform animate-in zoom-in-95">
                  <button onClick={() => setViewingCodeBuyer(null)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>

                  <div className="mb-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-1">Access Code</h3>
                    <p className="text-slate-400 text-sm font-light">Code details for {viewingCodeBuyer.name}.</p>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-6 relative">
                    <p className="text-white/80 text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {`Hello ${viewingCodeBuyer.name},

Welcome to Trilight - Rise with 9! 

Join your tour here:
https://risewith9.com/explore/${viewingCodeBuyer.accessCode}

with this code ${viewingCodeBuyer.accessCode}`}
                    </p>
                    <button
                      onClick={() => {
                        const text = `Hello ${viewingCodeBuyer.name},

Welcome to Trilight - Rise with 9! 

Join your tour here:
https://risewith9.com/explore/${viewingCodeBuyer.accessCode}

with this code ${viewingCodeBuyer.accessCode}`;
                        navigator.clipboard.writeText(text).then(() => {
                          setCopyFeedback(true);
                          setTimeout(() => setCopyFeedback(false), 2000);
                        });
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {copyFeedback ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const text = `Hello ${viewingCodeBuyer.name},

Welcome to Trilight - Rise with 9! 

Join your tour here:
https://risewith9.com/explore/${viewingCodeBuyer.accessCode}

with this code ${viewingCodeBuyer.accessCode}`;
                        navigator.clipboard.writeText(text).then(() => {
                          setCopyFeedback(true);
                          setTimeout(() => setCopyFeedback(false), 2000);
                        });
                      }}
                      className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      {copyFeedback ? 'Copied!' : 'Copy Invite'}
                    </button>
                    <button
                      onClick={() => setViewingCodeBuyer(null)}
                      className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all border border-white/5"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create New Buyer Modal */}
            {isCreatingBuyer && (
              <div className="absolute top-0 right-0 bottom-0 left-20 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative bg-zinc-900 border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-4xl transform animate-in zoom-in-95">
                  <button onClick={() => { setIsCreatingBuyer(false); setEditingBuyer(null); }} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>

                  <div className="mb-6 text-center">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 mx-auto">
                      {editingBuyer ? <Edit size={28} /> : <UserPlus size={28} />}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{editingBuyer ? 'Edit Buyer' : 'Create New Buyer'}</h3>
                    <p className="text-slate-400 text-sm font-light">{editingBuyer ? 'Update buyer information.' : 'Add a new buyer to your registry.'}</p>
                  </div>

                  <form onSubmit={handleAddBuyer} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                        <User size={10} /> Full Name
                      </label>
                      <input
                        type="text"
                        value={newBuyerName}
                        onChange={(e) => setNewBuyerName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-white/40"
                        placeholder="Enter buyer's full name"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                        <Mail size={10} /> Email Address
                      </label>
                      <input
                        type="email"
                        value={newBuyerEmail}
                        onChange={(e) => setNewBuyerEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-white/40"
                        placeholder="buyer@example.com (optional)"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                        <Phone size={10} /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newBuyerPhone}
                        onChange={(e) => setNewBuyerPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-white/40"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setIsCreatingBuyer(false); setEditingBuyer(null); }}
                        className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all border border-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                      >
                        {editingBuyer ? 'Update Buyer' : 'Add Buyer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
