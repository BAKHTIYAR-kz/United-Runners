/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { 
  UserIcon, 
  ChartBarIcon, 
  CalculatorIcon, 
  CalendarDaysIcon, 
  FlagIcon,
  BoltIcon,
  TrophyIcon,
  MapPinIcon,
  FireIcon,
  UserGroupIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { generateTrainingPlan } from './services/gemini';

// --- Types ---

type View = 'profile' | 'stats' | 'calculator' | 'plan' | 'races';

interface UserStats {
  height: number; // cm
  weight: number; // kg
  club: string;
  stravaConnected: boolean;
  distance: {
    year: number;
    month: number;
    week: number;
    day: number;
  };
  records: {
    k5: string;
    k10: string;
    k21: string;
    k42: string;
    maxDistance: number;
  };
}

// --- Components ---

const NavButton = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center space-y-1 w-full py-3 transition-all duration-300
      ${active ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}
    `}
  >
    <Icon className={`w-6 h-6 transition-transform duration-300 ${active ? '-translate-y-1' : ''}`} />
    <span className="text-[10px] font-medium tracking-wide uppercase opacity-80">{label}</span>
  </button>
);

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 ${className}`}
  >
    {children}
  </div>
);

const StatBox = ({ label, value, unit, trend }: { label: string; value: string | number; unit: string; trend?: string }) => (
  <div className="flex flex-col">
    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</span>
    <div className="flex items-baseline space-x-1">
      <span className="text-2xl md:text-3xl font-light text-white font-mono">{value}</span>
      <span className="text-sm text-zinc-400">{unit}</span>
    </div>
    {trend && <span className="text-xs text-emerald-500 mt-1">{trend}</span>}
  </div>
);

// --- Views ---

const ProfileView = () => {
  const [stats, setStats] = useState<UserStats>({
    height: 178,
    weight: 72,
    club: "I Love Running Almaty",
    stravaConnected: true,
    distance: {
      year: 1240.5,
      month: 128.4,
      week: 32.2,
      day: 5.0,
    },
    records: {
      k5: "22:15",
      k10: "48:30",
      k21: "1:45:10",
      k42: "3:55:00",
      maxDistance: 42.2
    }
  });

  const clubs = [
    "I Love Running Almaty",
    "Astana Runners",
    "Almaty Marathon Club",
    "Extremal",
    "Без клуба"
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Профиль</h2>
          <p className="text-zinc-400">Ваши данные и рекорды.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <UserIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Strava Integration Box */}
      <div className="border border-orange-500/30 bg-orange-500/10 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded text-white font-bold flex items-center justify-center text-xs">S</div>
            <div>
                <div className="text-sm font-bold text-orange-100">STRAVA</div>
                <div className="text-xs text-orange-200/60">{stats.stravaConnected ? 'Синхронизировано' : 'Не подключено'}</div>
            </div>
        </div>
        <button 
            onClick={() => setStats({...stats, stravaConnected: !stats.stravaConnected})}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${stats.stravaConnected ? 'bg-orange-500 text-white border-orange-500' : 'border-orange-500/50 text-orange-500'}`}
        >
            {stats.stravaConnected ? <CheckBadgeIcon className="w-4 h-4" /> : 'Подключить'}
        </button>
      </div>

      {/* Club Selection */}
      <Card>
        <div className="flex justify-between items-center mb-2">
             <span className="text-zinc-500 text-sm uppercase tracking-wider">Беговой Клуб</span>
             <UserGroupIcon className="w-4 h-4 text-blue-500" />
        </div>
        <select 
            value={stats.club}
            onChange={(e) => setStats({...stats, club: e.target.value})}
            className="w-full bg-zinc-800 border-none text-white text-lg font-medium rounded focus:ring-1 focus:ring-blue-500 py-2 -ml-1 cursor-pointer"
        >
            {clubs.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Card>

      {/* Records Grid */}
      <h3 className="text-lg font-semibold text-white mt-8 mb-2 flex items-center gap-2">
        <TrophyIcon className="w-5 h-5 text-yellow-500" />
        Личные Рекорды
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-4">
             <div className="text-xs text-zinc-500 mb-1">5 км</div>
             <div className="text-xl font-mono text-white">{stats.records.k5}</div>
        </div>
        <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-4">
             <div className="text-xs text-zinc-500 mb-1">10 км</div>
             <div className="text-xl font-mono text-white">{stats.records.k10}</div>
        </div>
        <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-4">
             <div className="text-xs text-zinc-500 mb-1">21.1 км</div>
             <div className="text-xl font-mono text-white">{stats.records.k21}</div>
        </div>
        <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-4">
             <div className="text-xs text-zinc-500 mb-1">42.2 км</div>
             <div className="text-xl font-mono text-white">{stats.records.k42}</div>
        </div>
        <div className="col-span-2 md:col-span-2 bg-gradient-to-r from-zinc-800/40 to-emerald-900/20 border border-zinc-700 rounded-xl p-4 flex justify-between items-center">
             <div>
                <div className="text-xs text-emerald-400 mb-1 uppercase tracking-wider">Максимальный забег</div>
                <div className="text-xl font-mono text-white">{stats.records.maxDistance} км</div>
             </div>
             <FireIcon className="w-8 h-8 text-emerald-600/50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-500 text-sm">Вес</span>
            <BoltIcon className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-end space-x-2">
            <input 
              type="number" 
              value={stats.weight} 
              onChange={(e) => setStats({...stats, weight: Number(e.target.value)})}
              className="w-20 bg-transparent text-3xl font-mono text-white focus:outline-none border-b border-zinc-700 focus:border-emerald-500 transition-colors"
            />
            <span className="text-zinc-500 pb-1">кг</span>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-500 text-sm">Рост</span>
            <ChartBarIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-end space-x-2">
             <input 
              type="number" 
              value={stats.height} 
              onChange={(e) => setStats({...stats, height: Number(e.target.value)})}
              className="w-20 bg-transparent text-3xl font-mono text-white focus:outline-none border-b border-zinc-700 focus:border-blue-500 transition-colors"
            />
            <span className="text-zinc-500 pb-1">см</span>
          </div>
        </Card>
      </div>

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Общий километраж</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:bg-zinc-800/50 transition-colors">
          <StatBox label="Сегодня" value={stats.distance.day} unit="км" />
        </Card>
        <Card className="hover:bg-zinc-800/50 transition-colors">
          <StatBox label="Неделя" value={stats.distance.week} unit="км" trend="+12%" />
        </Card>
        <Card className="hover:bg-zinc-800/50 transition-colors">
          <StatBox label="Месяц" value={stats.distance.month} unit="км" />
        </Card>
        <Card className="hover:bg-zinc-800/50 transition-colors">
          <StatBox label="Год" value={stats.distance.year} unit="км" />
        </Card>
      </div>
    </div>
  );
};

const LeaderboardView = () => {
  const [filter, setFilter] = useState<'all' | 'club' | 'challenge'>('all');

  const participants = [
    { rank: 1, name: "Саша М.", club: "Astana Runners", distance: "42.2 км", time: "3:15:20", status: "Finished", type: 'all' },
    { rank: 2, name: "Игорь Т.", club: "I Love Running", distance: "42.2 км", time: "3:22:15", status: "Finished", type: 'all' },
    { rank: 3, name: "Вы", club: "I Love Running", distance: "35.0 км", time: "2:45:00", status: "Running", active: true, type: 'all' },
    { rank: 1, name: "Вы", club: "I Love Running", distance: "128.4 км", time: "-", status: "Month Leader", active: true, type: 'club' },
    { rank: 2, name: "Марина К.", club: "I Love Running", distance: "115.0 км", time: "-", status: "Chaser", type: 'club' },
    { rank: 1, name: "Олег П.", club: "Extremal", distance: "200.0 км", time: "-", status: "Ultra Beast", type: 'challenge' },
    { rank: 4, name: "Вы", club: "I Love Running", distance: "128.4 км", time: "-", status: "Challenger", active: true, type: 'challenge' },
  ];

  const filteredList = participants.filter(p => p.type === 'all' || p.type === filter).filter(p => filter === 'all' ? p.type === 'all' : true).sort((a,b) => a.rank - b.rank);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Рейтинг</h2>
          <p className="text-zinc-400">Соревнуйтесь с лучшими.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
          <TrophyIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-zinc-900 rounded-xl mb-6 border border-zinc-800">
        <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${filter === 'all' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Общий
        </button>
        <button 
            onClick={() => setFilter('club')}
            className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${filter === 'club' ? 'bg-blue-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Клубный
        </button>
        <button 
            onClick={() => setFilter('challenge')}
            className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${filter === 'challenge' ? 'bg-orange-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Челленджи
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/30 backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
          <div className="col-span-2 text-center">#</div>
          <div className="col-span-5">Атлет / Клуб</div>
          <div className="col-span-5 text-right">Результат</div>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {filteredList.map((p, idx) => (
            <div 
              key={idx} 
              className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${p.active ? 'bg-emerald-900/20' : 'hover:bg-zinc-800/30'}`}
            >
              <div className="col-span-2 flex justify-center">
                <span className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-mono
                  ${p.rank === 1 ? 'bg-yellow-500 text-black' : 
                    p.rank === 2 ? 'bg-zinc-400 text-black' :
                    p.rank === 3 ? 'bg-amber-700 text-black' : 'text-zinc-500'}
                `}>
                  {p.rank}
                </span>
              </div>
              <div className="col-span-5 font-medium text-white">
                <div className="flex items-center space-x-2">
                    <span className="truncate">{p.name}</span>
                    {p.active && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">{p.club}</div>
              </div>
              <div className="col-span-5 text-right">
                  <div className="font-mono text-zinc-300 truncate">{p.distance}</div>
                  {p.time !== "-" && <div className="font-mono text-zinc-500 text-xs">{p.time}</div>}
              </div>
            </div>
          ))}
          {filteredList.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm">
                  Нет данных в этой категории
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalculatorView = () => {
  const [distance, setDistance] = useState<string>('10');
  const [unit, setUnit] = useState<'km' | 'm'>('km');
  const [hours, setHours] = useState<string>('0');
  const [minutes, setMinutes] = useState<string>('50');
  const [seconds, setSeconds] = useState<string>('0');

  // Convert inputs to numbers safely
  const dVal = parseFloat(distance.replace(',', '.')) || 0;
  const hVal = parseInt(hours) || 0;
  const mVal = parseInt(minutes) || 0;
  const sVal = parseInt(seconds) || 0;

  const distKm = unit === 'km' ? dVal : dVal / 1000;
  const totalSeconds = hVal * 3600 + mVal * 60 + sVal;
  const totalMinutes = totalSeconds / 60;

  // Pace: Minutes per Km
  const paceDecimal = distKm > 0 ? totalMinutes / distKm : 0;
  
  // Speed: Km per Hour
  const speed = totalMinutes > 0 ? distKm / (totalMinutes / 60) : 0;

  const formatPace = (p: number) => {
    if (!p || !isFinite(p)) return "0:00";
    const min = Math.floor(p);
    const sec = Math.round((p - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const formatTime = (totalSec: number) => {
    if (!totalSec || !isFinite(totalSec)) return "-";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.round(totalSec % 60);
    
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const commonDistances = [
    { label: '400 м', km: 0.4 },
    { label: '1 км', km: 1 },
    { label: '3 км', km: 3 },
    { label: '5 км', km: 5 },
    { label: '10 км', km: 10 },
    { label: 'Полумарафон', km: 21.0975 },
    { label: 'Марафон', km: 42.195 },
    { label: '100 км', km: 100 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Калькулятор</h2>
          <p className="text-zinc-400">Расчет темпа и прогноз.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
          <CalculatorIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="h-full">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Данные</h3>
            
            <div className="space-y-4">
                {/* Distance Input */}
                <div>
                    <label className="text-xs text-zinc-400 block mb-1">Дистанция</label>
                    <div className="flex space-x-2">
                        <input 
                            type="number" 
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-lg"
                            placeholder="0"
                        />
                        <select 
                            value={unit}
                            onChange={(e) => setUnit(e.target.value as 'km' | 'm')}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="km">км</option>
                            <option value="m">м</option>
                        </select>
                    </div>
                </div>

                {/* Time Input */}
                <div>
                    <label className="text-xs text-zinc-400 block mb-1">Время (чч:мм:сс)</label>
                    <div className="flex space-x-2 items-center">
                        <input 
                            type="number" 
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-center text-lg"
                            placeholder="00"
                        />
                        <span className="text-zinc-600 font-bold">:</span>
                        <input 
                            type="number" 
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-center text-lg"
                            placeholder="00"
                        />
                        <span className="text-zinc-600 font-bold">:</span>
                        <input 
                            type="number" 
                            value={seconds}
                            onChange={(e) => setSeconds(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-center text-lg"
                            placeholder="00"
                        />
                    </div>
                </div>
            </div>
        </Card>

        {/* Results Section */}
        <div className="space-y-4">
             <div className="bg-blue-600 rounded-2xl p-6 text-center shadow-lg shadow-blue-900/20">
                <div className="text-blue-200 text-xs uppercase tracking-wider mb-2">Темп бега</div>
                <div className="text-5xl font-bold font-mono text-white tracking-tighter">{formatPace(paceDecimal)}</div>
                <div className="text-blue-200 text-sm mt-1">мин / км</div>
            </div>
             <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 text-center">
                <div className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Скорость</div>
                <div className="text-3xl font-bold font-mono text-zinc-200">{speed.toFixed(2)}</div>
                <div className="text-zinc-500 text-sm mt-1">км / ч</div>
            </div>
        </div>
      </div>

      {/* Breakdown / Splits Table */}
      <Card>
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Прогноз результата</h3>
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
                <thead className="bg-zinc-800/50 text-zinc-400">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Дистанция</th>
                        <th className="px-4 py-3 text-right font-medium">Время</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {commonDistances.map((d, i) => {
                         const predictedSeconds = d.km * paceDecimal * 60;
                         return (
                            <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-4 py-3 text-zinc-300">{d.label}</td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-400">{formatTime(predictedSeconds)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
};

const PlanView = () => {
  const [tab, setTab] = useState<'ai' | 'gpp' | 'drills'>('ai');
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState('Любитель');
  const [goal, setGoal] = useState('Полумарафон из 2 часов');

  const handleGenerate = async () => {
    setIsLoading(true);
    const plan = await generateTrainingPlan(level, goal, 4);
    setGeneratedPlan(plan);
    setIsLoading(false);
  };

  const drills = [
      { name: "Бег с высоким подниманием бедра", desc: "Корпус прямой, высокая частота, акцент на подъем." },
      { name: "Захлест голени", desc: "Пятки касаются ягодиц, колени смотрят вниз." },
      { name: "Многоскоки (Олений бег)", desc: "Мощное отталкивание и фаза полета." },
      { name: "Семенящий бег", desc: "Мелкие шаги с расслабленной стопой и высокой частотой." }
  ];

  const gpp = [
      { name: "Планка", sets: "3 x 45 сек", desc: "Укрепление кора." },
      { name: "Выпады", sets: "3 x 15 (на ногу)", desc: "Сила квадрицепсов и ягодиц." },
      { name: "Подъемы на носки", sets: "3 x 20", desc: "Укрепление икр и ахилла." },
      { name: "Берпи", sets: "3 x 12", desc: "Общая выносливость и взрывная сила." },
      { name: "Русский твист", sets: "3 x 30", desc: "Косые мышцы пресса." }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Тренировки</h2>
          <p className="text-zinc-400">План, ОФП и СБУ.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
          <CalendarDaysIcon className="w-6 h-6" />
        </div>
      </div>

       {/* Training Tabs */}
       <div className="flex p-1 bg-zinc-900 rounded-xl mb-6 border border-zinc-800">
        <button 
            onClick={() => setTab('ai')}
            className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${tab === 'ai' ? 'bg-purple-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            AI План
        </button>
        <button 
            onClick={() => setTab('gpp')}
            className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${tab === 'gpp' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            ОФП (Сила)
        </button>
        <button 
            onClick={() => setTab('drills')}
            className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${tab === 'drills' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            СБУ (Техника)
        </button>
      </div>

      {tab === 'ai' && (
        <>
            {!generatedPlan && !isLoading && (
                <Card className="border-dashed border-2 border-zinc-800 !bg-transparent">
                <div className="space-y-4">
                    <div>
                    <label className="text-sm text-zinc-400 block mb-2">Ваш уровень</label>
                    <select 
                        value={level} 
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="Новичок">Новичок</option>
                        <option value="Любитель">Любитель</option>
                        <option value="Продвинутый">Продвинутый</option>
                        <option value="Элита">Элита</option>
                    </select>
                    </div>
                    <div>
                    <label className="text-sm text-zinc-400 block mb-2">Главная цель</label>
                    <input 
                        type="text" 
                        value={goal} 
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Например: 10 км быстрее 50 минут"
                    />
                    </div>
                    <button 
                    onClick={handleGenerate}
                    className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2"
                    >
                    <BoltIcon className="w-5 h-5" />
                    <span>Создать План (AI)</span>
                    </button>
                </div>
                </Card>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 animate-pulse">Тренер составляет программу...</p>
                </div>
            )}

            {generatedPlan && (
                <div className="space-y-4">
                <div 
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedPlan }} 
                />
                <button 
                    onClick={() => setGeneratedPlan(null)}
                    className="text-sm text-zinc-500 underline decoration-zinc-700 hover:text-zinc-300"
                >
                    Создать новый план
                </button>
                </div>
            )}
        </>
      )}

      {tab === 'gpp' && (
          <div className="grid gap-3">
              {gpp.map((ex, i) => (
                  <div key={i} className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50 flex justify-between items-center">
                      <div>
                          <div className="font-semibold text-white">{ex.name}</div>
                          <div className="text-xs text-zinc-400">{ex.desc}</div>
                      </div>
                      <div className="bg-zinc-900 px-3 py-1 rounded text-emerald-400 font-mono text-sm border border-zinc-700">
                          {ex.sets}
                      </div>
                  </div>
              ))}
          </div>
      )}

      {tab === 'drills' && (
          <div className="grid gap-3">
              {drills.map((drill, i) => (
                  <div key={i} className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50">
                      <div className="font-semibold text-white mb-1">{drill.name}</div>
                      <div className="text-sm text-zinc-400 leading-snug">{drill.desc}</div>
                  </div>
              ))}
              <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl text-xs text-blue-200 mt-4">
                  Совет: Выполняйте СБУ перед основной скоростной работой или после легкого кросса, 2-3 раза в неделю. Дистанция каждого упражнения 30-50 метров.
              </div>
          </div>
      )}

    </div>
  );
};

const RacesView = () => {
  const races = [
    { id: 1, title: "Алматы Марафон", date: "29 Сентября 2024", loc: "Алматы", dist: "10k, 21k, 42k", image: "bg-gradient-to-br from-green-500 to-emerald-700" },
    { id: 2, title: "Astana Marathon", date: "08 Сентября 2024", loc: "Астана", dist: "10k, 42k", image: "bg-gradient-to-br from-blue-400 to-blue-600" },
    { id: 3, title: "Tengri Ultra", date: "Май 2025", loc: "Или, Алматинская обл.", dist: "15k, 35k, 70k", image: "bg-gradient-to-br from-orange-500 to-red-600" },
    { id: 4, title: "Irbis Race", date: "Август 2025", loc: "Заилийский Алатау", dist: "21k, 42k, Skyrace", image: "bg-gradient-to-br from-zinc-600 to-zinc-800" },
    { id: 5, title: "Turkistan Marathon", date: "Октябрь 2024", loc: "Туркестан", dist: "10k, 21k, 42k", image: "bg-gradient-to-br from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Забеги</h2>
          <p className="text-zinc-400">Календарь стартов Казахстана.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <FlagIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="grid gap-4">
        {races.map(item => (
          <Card key={item.id} className="group hover:bg-zinc-800/80 transition-all cursor-pointer relative overflow-hidden">
             {/* Decorative colored bar */}
             <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.image}`}></div>
             
             <div className="flex justify-between items-start pl-3">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <div className="flex flex-col space-y-1 text-sm text-zinc-400">
                        <div className="flex items-center space-x-2">
                            <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
                            <span>{item.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-zinc-500" />
                            <span>{item.loc}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Дистанции</div>
                    <div className="font-mono text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded inline-block text-sm border border-emerald-900/50">
                        {item.dist}
                    </div>
                    <button className="mt-4 block w-full text-xs bg-white text-black font-bold py-2 px-4 rounded hover:bg-zinc-200 transition-colors">
                        Регистрация
                    </button>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<View>('profile');

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-50 font-sans selection:bg-emerald-500/30 flex overflow-hidden">
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/50 bg-black/20 p-6">
        <div className="flex items-center space-x-2 mb-12">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg shrink-0"></div>
            <span className="text-lg font-black tracking-widest italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 whitespace-nowrap">
              UNITED RUNNERS
            </span>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { id: 'profile', label: 'Профиль', icon: UserIcon },
            { id: 'stats', label: 'Рейтинг', icon: ChartBarIcon },
            { id: 'calculator', label: 'Калькулятор', icon: CalculatorIcon },
            { id: 'plan', label: 'Тренировки', icon: CalendarDaysIcon },
            { id: 'races', label: 'Забеги', icon: FlagIcon },
          ].map((item) => (
             <button
                key={item.id}
                onClick={() => setActiveTab(item.id as View)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
          ))}
        </nav>

        <div className="text-xs text-zinc-600 font-mono">
            v2.1.0 KZ Edition
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative h-[100dvh] overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-zinc-800/50 flex items-center px-6 shrink-0 bg-zinc-950/80 backdrop-blur-md z-20">
             <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-blue-500 rounded mr-3 shrink-0"></div>
             <span className="font-black tracking-widest italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">UNITED RUNNERS</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-24 md:p-12 md:pb-12 max-w-5xl mx-auto w-full no-scrollbar">
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'stats' && <LeaderboardView />}
            {activeTab === 'calculator' && <CalculatorView />}
            {activeTab === 'plan' && <PlanView />}
            {activeTab === 'races' && <RacesView />}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 pb-safe z-30">
            <div className="flex justify-around items-center px-2">
                <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={UserIcon} label="Профиль" />
                <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={ChartBarIcon} label="Рейтинг" />
                <NavButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={CalculatorIcon} label="Темп" />
                <NavButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={CalendarDaysIcon} label="План" />
                <NavButton active={activeTab === 'races'} onClick={() => setActiveTab('races')} icon={FlagIcon} label="Забеги" />
            </div>
        </div>
      </main>

      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

    </div>
  );
};

export default App;