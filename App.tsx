
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import { 
  UserProfile, 
  UserLevel, 
  TrainingGoal, 
  WeeklyPlan, 
  RunRecord,
  RunningRoute
} from './types';
import { ROUTES, GOAL_DESCRIPTIONS } from './constants';
import { generateTrainingPlan, getFuturoPrediction } from './services/geminiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Fire, 
  Timer, 
  NavigationArrow, 
  ArrowRight,
  Play,
  CheckCircle,
  Trophy,
  MapPin,
  X,
  Stop,
  Lightning,
  Pulse
} from "@phosphor-icons/react";
import FuturoCard from './components/FuturoCard';

const App: React.FC = () => {
  // Persistence Mock
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('futurorun_profile');
    return saved ? JSON.parse(saved) : {
      name: '',
      age: 25,
      weight: 70,
      level: UserLevel.BEGINNER,
      experienceYears: 0,
      goal: TrainingGoal.HEALTH,
      isRegistered: false,
    };
  });

  const [activeTab, setActiveTab] = useState('home');
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [prediction, setPrediction] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  
  // Route Tracking State
  const [selectedRoute, setSelectedRoute] = useState<RunningRoute | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState({
    distance: 0,
    seconds: 0,
    pace: '0:00',
    kcal: 0
  });
  
  const timerRef = useRef<number | null>(null);
  const geoRef = useRef<number | null>(null);

  useEffect(() => {
    if (profile.isRegistered) {
      localStorage.setItem('futurorun_profile', JSON.stringify(profile));
      initData();
    }
  }, [profile.isRegistered]);

  const initData = async () => {
    setLoadingPlan(true);
    try {
      const plan = await generateTrainingPlan(profile);
      setWeeklyPlan(plan);
      setLoadingPrediction(true);
      const pred = await getFuturoPrediction(history, profile);
      setPrediction(pred);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPlan(false);
      setLoadingPrediction(false);
    }
  };

  // Tracking Logic
  const startTracking = () => {
    setIsTracking(true);
    setTrackingData({ distance: 0, seconds: 0, pace: '0:00', kcal: 0 });
    
    timerRef.current = window.setInterval(() => {
      setTrackingData(prev => {
        const newSeconds = prev.seconds + 1;
        // Simulación de movimiento para demo
        const newDistance = prev.distance + 0.0025; 
        const minutes = newSeconds / 60;
        const paceValue = newDistance > 0 ? (minutes / newDistance) : 0;
        const paceStr = paceValue > 0 ? 
          `${Math.floor(paceValue)}:${Math.floor((paceValue % 1) * 60).toString().padStart(2, '0')}` : '0:00';
        
        return {
          ...prev,
          seconds: newSeconds,
          distance: newDistance,
          pace: paceStr,
          kcal: Math.floor(newDistance * 65)
        };
      });
    }, 1000);

    if (navigator.geolocation) {
      geoRef.current = navigator.geolocation.watchPosition((pos) => {
        console.log("GPS Activo:", pos.coords.latitude, pos.coords.longitude);
      }, (err) => console.error(err), { enableHighAccuracy: true });
    }
  };

  const stopTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (geoRef.current) navigator.geolocation.clearWatch(geoRef.current);
    
    const newRecord: RunRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      distanceKm: parseFloat(trackingData.distance.toFixed(2)),
      timeSeconds: trackingData.seconds,
      calories: trackingData.kcal,
      averagePace: trackingData.pace
    };
    
    setHistory(prev => [...prev, newRecord]);
    setIsTracking(false);
    setSelectedRoute(null);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({ ...prev, isRegistered: true }));
  };

  if (!profile.isRegistered) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-8 flex flex-col justify-center items-center font-futuristic">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2 neon-text-cyan tracking-tighter">FUTURORUN</h1>
          <p className="text-gray-400 mb-8 font-sans">El futuro de tu entrenamiento empieza aquí.</p>
          
          <form onSubmit={handleRegister} className="space-y-6 font-sans">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
              <input 
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 focus:border-cyan-400 focus:outline-none transition-all text-white"
                placeholder="Escribe tu nombre..."
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Edad</label>
                <input 
                  type="number"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 focus:border-cyan-400 focus:outline-none transition-all text-white"
                  value={profile.age}
                  onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Peso (kg)</label>
                <input 
                  type="number"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 focus:border-cyan-400 focus:outline-none transition-all text-white"
                  value={profile.weight}
                  onChange={e => setProfile({...profile, weight: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Objetivo</label>
              <select 
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 focus:border-cyan-400 focus:outline-none appearance-none text-white"
                value={profile.goal}
                onChange={e => setProfile({...profile, goal: e.target.value as TrainingGoal})}
              >
                {Object.values(TrainingGoal).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all font-futuristic uppercase tracking-widest mt-4"
            >
              Iniciar Protocolo
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MODO SEGUIMIENTO (TRACKING) ---
  if (isTracking && selectedRoute) {
    return (
      <div className="fixed inset-0 z-[100] bg-black font-futuristic flex flex-col p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-12">
          <div>
            <p className="text-cyan-400 text-[10px] tracking-[0.3em] uppercase mb-1">Misión en Curso</p>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{selectedRoute.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-red-500 font-bold animate-pulse">REC</span>
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center gap-16">
          <div className="text-center">
            <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-4">Distancia (KM)</p>
            <div className="relative">
              <span className="text-8xl font-bold text-white tracking-tighter neon-text-cyan">
                {trackingData.distance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 w-full gap-8">
            <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Timer size={14} /> Tiempo
              </p>
              <p className="text-3xl text-white">{formatTime(trackingData.seconds)}</p>
            </div>
            <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Pulse size={14} /> Ritmo
              </p>
              <p className="text-3xl text-cyan-400">{trackingData.pace}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              <span>Progreso de Ruta</span>
              <span className="text-cyan-400">{Math.min(Math.round((trackingData.distance / selectedRoute.distance) * 100), 100)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_15px_cyan] transition-all duration-500" 
                style={{ width: `${Math.min((trackingData.distance / selectedRoute.distance) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <button 
            onClick={stopTracking}
            className="w-full bg-red-500/10 border border-red-500/50 text-red-500 py-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all uppercase tracking-widest"
          >
            <Stop size={24} weight="fill" />
            Finalizar Seguimiento
          </button>
        </div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Bienvenido, {profile.name}</h2>
          <p className="text-2xl font-bold font-futuristic text-white">ESTADO ACTUAL</p>
        </div>
        <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Puntos Futuro</p>
          <p className="text-xl font-futuristic text-cyan-400">1,240 XP</p>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
          <Pulse size={24} weight="fill" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Próxima Sesión</p>
          <p className="text-lg font-bold text-white">Rodaje Suave (Zona 2)</p>
          <p className="text-xs text-cyan-400/80 mt-1">45 min @ 6:00 min/km</p>
        </div>
        <button className="ml-auto p-3 rounded-full bg-white text-black hover:scale-105 transition-transform">
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>

      <FuturoCard prediction={prediction} loading={loadingPrediction} />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-futuristic text-sm tracking-widest text-gray-400 uppercase">Actividad Semanal</h3>
          <div className="flex gap-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold px-2 py-1 bg-gray-900 border border-gray-800 rounded">Distancia (km)</span>
          </div>
        </div>
        <div className="h-48 w-full bg-gray-900/30 rounded-2xl border border-gray-800 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { day: 'L', km: 5 },
              { day: 'M', km: 8 },
              { day: 'X', km: 0 },
              { day: 'J', km: 6 },
              { day: 'V', km: 10 },
              { day: 'S', km: 0 },
              { day: 'D', km: 15 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #374151', borderRadius: '12px' }}
                itemStyle={{ color: '#22d3ee' }}
              />
              <Line 
                type="monotone" 
                dataKey="km" 
                stroke="#22d3ee" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }} 
                // Fix: Removed 'shadow' property as it is not a valid prop for activeDot in recharts
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Entrenamiento</h2>
          <p className="text-2xl font-bold font-futuristic text-white">PLAN SEMANAL</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Objetivo</p>
          <p className="text-sm font-bold text-cyan-400">{profile.goal}</p>
        </div>
      </div>

      {loadingPlan ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-gray-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : weeklyPlan?.sessions.map((session, idx) => (
        <div key={idx} className={`rounded-2xl border transition-all ${
          session.type === 'Rest' ? 'bg-gray-900/20 border-gray-800' : 'bg-gray-900/40 border-gray-800 hover:border-cyan-500/50'
        } p-5 flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-futuristic text-xs ${
             session.type === 'Rest' ? 'bg-gray-800 text-gray-500' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          }`}>
            {session.day.substring(0, 1)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className={`font-bold text-sm ${session.type === 'Rest' ? 'text-gray-500' : 'text-white'}`}>{session.type}</p>
              {session.durationMinutes > 0 && (
                 <span className="text-[10px] text-gray-500 font-bold uppercase">{session.durationMinutes} MIN</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{session.description}</p>
          </div>
          {session.type !== 'Rest' && (
            <button className="text-gray-600 hover:text-cyan-400">
              <CheckCircle size={24} weight="light" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Explorar</h2>
          <p className="text-2xl font-bold font-futuristic text-white">RUTAS LOCALES</p>
        </div>
      </div>

      <div className="grid gap-4">
        {ROUTES.map(route => (
          <div 
            key={route.id} 
            onClick={() => setSelectedRoute(route)}
            className="group overflow-hidden rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer"
          >
            <div className="relative h-40 overflow-hidden bg-gray-800">
               <img 
                 src={`https://picsum.photos/seed/${route.id}/600/300`} 
                 alt={route.name}
                 className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
               <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 uppercase tracking-widest">{route.location}</span>
                  </div>
                  <h4 className="text-xl font-bold font-futuristic text-white">{route.name}</h4>
               </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-gray-900/40">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mb-1">Distancia</span>
                  <span className="text-sm font-futuristic text-white">{route.distance} KM</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mb-1">Desnivel</span>
                  <span className="text-sm font-futuristic text-white">+{route.elevation}M</span>
                </div>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 ${
                route.difficulty === 'Fácil' ? 'text-green-400 border-green-400/20' : route.difficulty === 'Moderada' ? 'text-yellow-400 border-yellow-400/20' : 'text-red-400 border-red-400/20'
              }`}>
                {route.difficulty}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detallado de Ruta */}
      {selectedRoute && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-300 flex flex-col p-6 overflow-y-auto pb-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Detalles de Protocolo</h2>
            <button 
              onClick={() => setSelectedRoute(null)}
              className="p-2 bg-gray-900 rounded-full text-gray-400 hover:text-white border border-gray-800"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 space-y-8">
            <div className="relative h-56 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
               <img src={`https://picsum.photos/seed/${selectedRoute.id}/800/600`} className="w-full h-full object-cover" alt={selectedRoute.name} />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
               <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_15px_cyan]">{selectedRoute.location}</span>
                    <span className="px-3 py-1 bg-gray-900/80 text-gray-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-gray-700">GPS Active</span>
                  </div>
                  <h2 className="text-3xl font-bold font-futuristic text-white uppercase tracking-tighter leading-none">{selectedRoute.name}</h2>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
               <div className="bg-gray-900/50 p-4 rounded-3xl border border-gray-800 text-center">
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Longitud</p>
                  <p className="font-futuristic text-lg text-white">{selectedRoute.distance}km</p>
               </div>
               <div className="bg-gray-900/50 p-4 rounded-3xl border border-gray-800 text-center">
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Ascenso</p>
                  <p className="font-futuristic text-lg text-white">+{selectedRoute.elevation}m</p>
               </div>
               <div className="bg-gray-900/50 p-4 rounded-3xl border border-gray-800 text-center">
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Dificultad</p>
                  <p className={`font-futuristic text-sm mt-1 uppercase ${selectedRoute.difficulty === 'Fácil' ? 'text-green-400' : 'text-yellow-400'}`}>{selectedRoute.difficulty}</p>
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <MapPin size={16} className="text-cyan-400" /> Resumen de Entorno
              </div>
              <p className="text-gray-400 text-sm leading-relaxed italic border-l-2 border-cyan-500/50 pl-4 bg-cyan-500/5 p-4 rounded-r-xl">
                "{selectedRoute.description}"
              </p>
            </div>

            <div className="bg-gray-900/30 p-5 rounded-3xl border border-gray-800 space-y-4">
               <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Topografía Estimada</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]" />
                    <span className="text-[9px] text-cyan-400 font-bold uppercase">Datos Analizados</span>
                  </div>
               </div>
               <div className="h-20 flex items-end gap-1.5 px-1">
                  {[35, 55, 40, 75, 95, 80, 60, 80, 90, 100, 95, 110, 100, 120].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-cyan-950 to-cyan-500/50 rounded-full transition-all duration-500" style={{ height: `${h}%` }} />
                  ))}
               </div>
            </div>
          </div>

          <button 
            onClick={startTracking}
            className="w-full mt-10 bg-cyan-500 hover:bg-cyan-400 text-black py-6 rounded-2xl font-bold font-futuristic uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center gap-4 transition-all active:scale-95"
          >
            <Lightning size={24} weight="fill" />
            Comenzar Protocolo
          </button>
        </div>
      )}
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Predicción</h2>
          <p className="text-2xl font-bold font-futuristic text-white">MODO FUTURO</p>
        </div>
      </div>

      <FuturoCard prediction={prediction} loading={loadingPrediction} />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Timer size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ritmo Medio</span>
          </div>
          <p className="text-2xl font-futuristic text-white">5:42</p>
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">↑ 2% vs semana pasada</span>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <Fire size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Consumo Cal</span>
          </div>
          <p className="text-2xl font-futuristic text-white">2.8k</p>
          <span className="text-[10px] text-orange-400/60 font-bold uppercase tracking-tighter">Metabolismo optimizado</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-yellow-400 shadow-inner">
              <Trophy size={28} weight="duotone" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Próximo Logro</p>
              <p className="text-xs text-gray-400 italic">"Corredor Constante" (3 días seguidos)</p>
            </div>
         </div>
         <div className="w-16 h-16 relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-white/10" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-cyan-400" strokeDasharray="75, 100" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-futuristic text-cyan-400">75%</div>
         </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Historial de Misiones</h3>
        {history.length === 0 ? (
          <p className="text-xs text-gray-600 italic px-2">No hay registros de entrenamiento aún.</p>
        ) : history.slice().reverse().map(run => (
          <div key={run.id} className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800 flex justify-between items-center transition-all hover:bg-gray-900/60">
            <div>
              <p className="text-white font-bold text-sm">{run.distanceKm} km</p>
              <p className="text-[10px] text-gray-500">{run.date} • {run.averagePace} min/km</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-cyan-400 font-bold">{Math.floor(run.timeSeconds/60)}m {run.timeSeconds%60}s</p>
              <p className="text-[10px] text-orange-400/70">{run.calories} kcal</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center p-8">
        <div className="w-24 h-24 rounded-full border-2 border-cyan-400 p-1 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.4)] overflow-hidden">
           <img src={`https://picsum.photos/seed/${profile.name}/200`} className="w-full h-full rounded-full object-cover" alt="Profile" />
        </div>
        <h2 className="text-2xl font-bold font-futuristic text-white uppercase tracking-tighter">{profile.name}</h2>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Sujeto Experimental Alpha-01</p>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Nivel Operativo', value: profile.level },
          { label: 'Objetivo Primario', value: profile.goal },
          { label: 'Masa Corporal', value: `${profile.weight} kg` },
          { label: 'Ciclo Vital', value: `${profile.age} años` },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center p-4 bg-gray-900 rounded-xl border border-gray-800">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.label}</span>
            <span className="text-sm font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          localStorage.removeItem('futurorun_profile');
          window.location.reload();
        }}
        className="w-full p-4 border border-red-900/50 bg-red-900/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-900/20 transition-all mt-8"
      >
        Formatear Datos de Perfil
      </button>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'training' && renderTraining()}
      {activeTab === 'routes' && renderRoutes()}
      {activeTab === 'progress' && renderProgress()}
      {activeTab === 'profile' && renderProfile()}
    </Layout>
  );
};

export default App;
