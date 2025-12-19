import React, { useState, useEffect } from 'react';
import { Clock, Phone, Mic, MicOff, MapPin, ArrowRight, X, Sparkles, MessageSquare } from 'lucide-react';
import { Unit, AccessCode } from '../types';
import { generateUnitDescription } from '../services/geminiService';

interface BuyerExperienceProps {
  accessCode: AccessCode;
  unit: Unit;
  onExit: () => void;
}

const ROOMS = [
  { id: 'living', name: 'Living Room', image: 'https://picsum.photos/1920/1080?grayscale', description: 'Spacious living area with floor-to-ceiling windows.' },
  { id: 'kitchen', name: 'Gourmet Kitchen', image: 'https://picsum.photos/1920/1080?blur=2', description: 'Italian marble countertops with smart appliances.' },
  { id: 'master', name: 'Master Suite', image: 'https://picsum.photos/1920/1080', description: 'King-sized layout with walk-in closet.' },
  { id: 'balcony', name: 'Sky Deck', image: 'https://picsum.photos/1920/1080?blur=1', description: 'Panoramic city views.' },
];

export const BuyerExperience: React.FC<BuyerExperienceProps> = ({ accessCode, unit, onExit }) => {
  const [currentRoom, setCurrentRoom] = useState(ROOMS[0]);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 Hour in seconds
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [aiDesc, setAiDesc] = useState<string>('');
  const [showAiPopup, setShowAiPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExit(); // Boot user when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExit]);

  // Simulate generating a description when room changes
  useEffect(() => {
    const fetchDesc = async () => {
        // In a real scenario, we would cache this or generate it based on room data
        // For demo, we use the unit data + room name
        setShowAiPopup(true);
        const desc = await generateUnitDescription({ ...unit, type: `${unit.type} - ${currentRoom.name}` });
        setAiDesc(desc);
        // Auto hide after 8 seconds
        setTimeout(() => setShowAiPopup(false), 8000);
    };
    fetchDesc();
  }, [currentRoom, unit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {/* HUD - Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 pointer-events-auto">
          <h1 className="text-white font-bold text-lg">{unit.type} Residence</h1>
          <p className="text-slate-300 text-sm">Tower {unit.tower}, Floor {unit.floor}</p>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          {/* Timer */}
          <div className="bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 text-white font-mono font-bold shadow-lg shadow-red-500/20">
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          
          {/* Builder Call Button */}
          <button 
            onClick={() => setIsCallActive(!isCallActive)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white font-medium transition-all ${isCallActive ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10'}`}
          >
            <Phone size={18} className={isCallActive ? 'animate-pulse' : ''} />
            {isCallActive ? 'Builder Connected' : 'Call Builder'}
          </button>
        </div>
      </div>

      {/* Main Viewport (Simulated 3D) */}
      <div className="flex-1 relative">
        <img 
          src={currentRoom.image} 
          alt={currentRoom.name} 
          className="w-full h-full object-cover animate-fade-in transition-opacity duration-700"
          key={currentRoom.id}
        />
        
        {/* Hotspots / Room Navigation */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 z-20 p-4">
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => setCurrentRoom(room)}
              className={`px-6 py-3 rounded-full backdrop-blur-md border transition-all transform hover:scale-105 ${currentRoom.id === room.id ? 'bg-white text-black border-white font-bold' : 'bg-black/50 text-white border-white/20 hover:bg-black/70'}`}
            >
              {room.name}
            </button>
          ))}
        </div>

        {/* AI Description Popup */}
        <div className={`absolute top-24 right-8 w-80 bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 p-4 rounded-xl shadow-2xl transition-all duration-500 transform ${showAiPopup ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">AI Guide</span>
            <button onClick={() => setShowAiPopup(false)} className="ml-auto text-slate-500 hover:text-white"><X size={14}/></button>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            "{aiDesc}"
          </p>
        </div>
      </div>

      {/* Call Overlay UI (When Active) */}
      {isCallActive && (
        <div className="absolute bottom-32 right-8 bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-700 w-64 animate-slide-up">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
               <span className="text-xl">👨‍💼</span>
             </div>
             <div>
               <p className="font-bold text-sm">John (Sales)</p>
               <p className="text-xs text-green-400 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Live Audio
               </p>
             </div>
           </div>
           
           <div className="flex justify-between items-center bg-slate-800 rounded-lg p-2">
             <div className="h-8 flex gap-1 items-end justify-center w-full px-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: '0.5s' }}></div>
                ))}
             </div>
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className={`p-2 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-white'}`}
             >
               {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
             </button>
           </div>
        </div>
      )}
    </div>
  );
};