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
  NewspaperIcon, 
  InformationCircleIcon,
  BoltIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { generateTrainingPlan } from './services/gemini';

// --- Types ---

type View = 'profile' | 'stats' | 'calculator' | 'plan' | 'news' | 'info';

interface UserStats {
  height: number; // cm
  weight: number; // kg
  distance: {
    year: number;
    month: number;
    week: number;
    day: number;
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
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 ${className}`}>
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
    distance: {
      year: 1240.5,
      month: 128.4,
      week: 32.2,
      day: 5.0,
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Профиль</h2>
          <p className="text-zinc-400">Ваши физические данные и прогресс.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <UserIcon className="w-6 h-6" />
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

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Журнал Дистанции</h3>
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
  const participants = [
    { rank: 1, name: "Саша М.", distance: "42.2 км", time: "3:15:20", status: "Finished" },
    { rank: 2, name: "Игорь Т.", distance: "42.2 км", time: "3:22:15", status: "Finished" },
    { rank: 3, name: "Вы", distance: "35.0 км", time: "2:45:00", status: "Running", active: true },
    { rank: 4, name: "Алексей Р.", distance: "34.5 км", time: "2:48:30", status: "Running" },
    { rank: 5, name: "Елена В.", distance: "32.0 км", time: "2:50:10", status: "Running" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Рейтинг</h2>
          <p className="text-zinc-400">Прямой эфир забега.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
          <TrophyIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/30 backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
          <div className="col-span-2 text-center">#</div>
          <div className="col-span-4">Атлет</div>
          <div className="col-span-3 text-right">Дист.</div>
          <div className="col-span-3 text-right">Время</div>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {participants.map((p) => (
            <div 
              key={p.rank} 
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
              <div className="col-span-4 font-medium text-white flex items-center space-x-2">
                <span className="truncate">{p.name}</span>
                {p.active && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>}
              </div>
              <div className="col-span-3 text-right font-mono text-zinc-300 truncate">{p.distance}</div>
              <div className="col-span-3 text-right font-mono text-zinc-400 text-xs sm:text-sm truncate">{p.time}</div>
            </div>
          ))}
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
          <h2 className="text-3xl font-bold text-white tracking-tight">Универсальный Калькулятор</h2>
          <p className="text-zinc-400">Расчет темпа и прогнозирование результатов.</p>
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
                         // Only show calculation if the calculated time is reasonable (e.g., less than 24 hours for simplicity, though ultra runners run longer)
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Тренировки</h2>
          <p className="text-zinc-400">Индивидуальный план от AI.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
          <CalendarDaysIcon className="w-6 h-6" />
        </div>
      </div>

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
    </div>
  );
};

const NewsView = () => {
  const news = [
    { id: 1, title: "Breaking 2: Наука о новых кроссовках", source: "Runner's World", time: "2ч", image: "bg-orange-500" },
    { id: 2, title: "Регистрация на Московский Марафон", source: "City News", time: "5ч", image: "bg-blue-500" },
    { id: 3, title: "Питание перед длинной дистанцией", source: "Health Daily", time: "1д", image: "bg-green-500" },
    { id: 4, title: "Обзор беспроводных наушников", source: "TechRun", time: "1д", image: "bg-zinc-700" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Новости</h2>
          <p className="text-zinc-400">Мир бега.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
          <NewspaperIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="grid gap-4">
        {news.map(item => (
          <Card key={item.id} className="group hover:bg-zinc-800/80 transition-all cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-lg ${item.image} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}></div>
              <div>
                <h3 className="font-semibold text-zinc-200 group-hover:text-white mb-1 leading-snug">{item.title}</h3>
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <span>{item.source}</span>
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const InfoView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Инфо</h2>
          <p className="text-zinc-400">О приложении.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center text-zinc-400">
          <InformationCircleIcon className="w-6 h-6" />
        </div>
      </div>
    
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">О UNITED RUNNERS</h3>
      <p className="text-zinc-400 leading-relaxed text-sm mb-4">
        UNITED RUNNERS — это концептуальное приложение для современного бегуна, который ценит эстетику так же высоко, как и результаты.
        Создано с использованием React, Tailwind CSS и Gemini AI.
      </p>
      <div className="border-t border-zinc-800 pt-4 mt-4">
        <h4 className="text-sm font-medium text-white mb-2">Технологии</h4>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>Design: Minimalist Dark Mode</li>
          <li>AI Engine: Google Gemini 2.5 Flash</li>
        </ul>
      </div>
    </Card>
  </div>
);

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
            { id: 'news', label: 'Новости', icon: NewspaperIcon },
            { id: 'info', label: 'Инфо', icon: InformationCircleIcon },
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
            v2.0.0 Stable
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
            {activeTab === 'news' && <NewsView />}
            {activeTab === 'info' && <InfoView />}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 pb-safe z-30">
            <div className="flex justify-around items-center px-2">
                <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={UserIcon} label="Профиль" />
                <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={ChartBarIcon} label="Рейтинг" />
                <NavButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={CalculatorIcon} label="Темп" />
                <NavButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={CalendarDaysIcon} label="План" />
                <NavButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={NewspaperIcon} label="Новости" />
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