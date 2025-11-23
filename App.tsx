
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
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
  CheckBadgeIcon,
  PlusCircleIcon,
  PlayCircleIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { generateTrainingPlan } from './services/gemini';

// --- Types ---

type View = 'profile' | 'club' | 'chat' | 'stats' | 'calculator' | 'plan' | 'races';

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

interface Club {
    id: string;
    name: string;
    desc: string;
    city: string;
    members: number;
    color: string;
}

interface Message {
    id: number;
    user: string;
    text: string;
    time: string;
    isMe: boolean;
    role?: string;
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

const ProfileView = ({ stats, setStats }: { stats: UserStats, setStats: any }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Профиль</h2>
          <p className="text-zinc-400">Ваши данные и прогресс.</p>
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

      {/* Current Club Display */}
      <Card className="border-l-4 border-l-blue-500">
        <div className="flex justify-between items-center">
            <div>
                <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Мой клуб</div>
                <div className="text-xl font-bold text-white">{stats.club}</div>
            </div>
            <UserGroupIcon className="w-6 h-6 text-blue-500 opacity-50" />
        </div>
      </Card>

       {/* Total Mileage - Moved Up */}
      <h3 className="text-lg font-semibold text-white mt-4 mb-4">Общий километраж</h3>
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
    </div>
  );
};

const ClubView = ({ currentClub, onJoin }: { currentClub: string, onJoin: (name: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState("");
    
    const clubs: Club[] = [
        { id: "1", name: "I Love Running", desc: "Крупнейшая школа правильного бега. Филиалы в Алматы и Астане.", city: "Алматы / Астана", members: 1240, color: "bg-red-500" },
        { id: "2", name: "Astana Runners", desc: "Сообщество любителей бега столицы. Совместные пробежки в триатлон парке.", city: "Астана", members: 850, color: "bg-blue-500" },
        { id: "3", name: "Almaty Marathon Club", desc: "Официальный клуб Алматы Марафона. Подготовка к главным стартам.", city: "Алматы", members: 2100, color: "bg-green-500" },
        { id: "4", name: "Extremal Athletics", desc: "Клуб любителей трейла и скайраннинга. Горы и хардкор.", city: "Алматы", members: 320, color: "bg-orange-500" },
        { id: "5", name: "Nomad Running", desc: "Кочевой дух. Забеги в уникальных локациях степи.", city: "KZ", members: 150, color: "bg-yellow-600" },
        { id: "6", name: "Raramuri Club", desc: "Философия естественного бега и ультра-дистанций.", city: "Алматы", members: 90, color: "bg-purple-500" },
    ];

    const filteredClubs = clubs.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCreateClub = () => {
        const name = prompt("Введите название вашего нового клуба:");
        if (name) onJoin(name);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-6">
                <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Беговые Клубы</h2>
                <p className="text-zinc-400">Присоединяйся к сообществу.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserGroupIcon className="w-6 h-6" />
                </div>
            </div>

            {/* Search and Create */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Поиск клуба..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <button 
                    onClick={handleCreateClub}
                    className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-xl transition-all"
                    title="Создать клуб"
                >
                    <PlusCircleIcon className="w-6 h-6" />
                </button>
            </div>

            <h3 className="text-lg font-semibold text-white mt-4">Клубы</h3>
            
            <div className="grid gap-4">
                {filteredClubs.length > 0 ? (
                    filteredClubs.map(club => (
                        <div key={club.id} className="group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full ${club.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                                    {club.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                        {club.name}
                                        {currentClub === club.name && <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />}
                                    </h4>
                                    <p className="text-sm text-zinc-400 line-clamp-2 max-w-md">{club.desc}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {club.city}</span>
                                        <span className="flex items-center gap-1"><UserGroupIcon className="w-3 h-3" /> {club.members} уч.</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => onJoin(club.name)}
                                disabled={currentClub === club.name}
                                className={`w-full md:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentClub === club.name ? 'bg-zinc-800 text-zinc-500 cursor-default' : 'bg-white text-black hover:bg-zinc-200'}`}
                            >
                                {currentClub === club.name ? 'Вы состоите' : 'Вступить'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800/50 border-dashed">
                        <UserGroupIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <h3 className="text-zinc-300 font-medium mb-1">Клуб не найден</h3>
                        <p className="text-zinc-500 text-sm mb-4">Попробуйте другой запрос или создайте свое сообщество.</p>
                        <button 
                            onClick={handleCreateClub}
                            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Создать "{searchTerm}"
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

const ChatView = ({ clubName }: { clubName: string }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, user: "Ерлан", role: "Coach", text: "Всем привет! Завтра длительная в 8:00 на терренкуре.", time: "19:30", isMe: false, avatarColor: "bg-blue-500" },
        { id: 2, user: "Алина", text: "Сколько планируем бежать?", time: "19:32", isMe: false, avatarColor: "bg-pink-500" },
        { id: 3, user: "Вы", text: "Я буду. Планирую 15км по 5:30.", time: "19:35", isMe: true },
        { id: 4, user: "Ерлан", role: "Coach", text: "Отлично! Бери изотоник.", time: "19:36", isMe: false, avatarColor: "bg-blue-500" },
        { id: 5, user: "Тимур", text: "Кто-нибудь едет на марафон в Ташкент?", time: "20:10", isMe: false, avatarColor: "bg-green-500" },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!message.trim()) return;
        const newMsg: Message = {
            id: Date.now(),
            user: "Вы",
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };
        setMessages([...messages, newMsg]);
        setMessage("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Чат Клуба</h2>
                    <p className="text-zinc-400 text-sm">{clubName}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            <div className="flex-1 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            {!msg.isMe && (
                                <div className={`w-8 h-8 rounded-full ${msg.avatarColor} flex items-center justify-center text-xs font-bold text-white mr-2 shrink-0`}>
                                    {msg.user.charAt(0)}
                                </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}>
                                {!msg.isMe && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-zinc-400">{msg.user}</span>
                                        {msg.role && <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 rounded uppercase tracking-wider">{msg.role}</span>}
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-emerald-200' : 'text-zinc-500'}`}>
                                    {msg.time}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Написать сообщение..."
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const LeaderboardView = () => {
  const [filter, setFilter] = useState<'all' | 'club'>('all');

  const participants = [
    { rank: 1, name: "Саша М.", club: "Astana Runners", distance: "42.2 км", time: "3:15:20", status: "Finished", type: 'all' },
    { rank: 2, name: "Игорь Т.", club: "I Love Running", distance: "42.2 км", time: "3:22:15", status: "Finished", type: 'all' },
    { rank: 3, name: "Вы", club: "I Love Running", distance: "35.0 км", time: "2:45:00", status: "Running", active: true, type: 'all' },
    { rank: 1, name: "Вы", club: "I Love Running", distance: "128.4 км", time: "-", status: "Month Leader", active: true, type: 'club' },
    { rank: 2, name: "Марина К.", club: "I Love Running", distance: "115.0 км", time: "-", status: "Chaser", type: 'club' },
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

const AnimatedExerciseIcon = ({ type }: { type: string }) => {
    // Simple visualization using CSS only (no external assets)
    return (
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center relative overflow-hidden border border-zinc-700/50 group-hover:border-emerald-500/50 transition-colors">
            <div className={`w-4 h-4 bg-zinc-400 rounded-sm ${type === 'jump' ? 'group-hover:animate-bounce' : type === 'run' ? 'group-hover:animate-pulse' : 'group-hover:animate-spin'}`}></div>
            <PlayCircleIcon className="w-6 h-6 text-white absolute opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}

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
      { name: "Бег с высоким бедром", desc: "Корпус прямой, высокая частота, акцент на подъем.", type: "jump" },
      { name: "Захлест голени", desc: "Пятки касаются ягодиц, колени смотрят строго вниз.", type: "run" },
      { name: "Многоскоки (Олений бег)", desc: "Мощное отталкивание и фаза полета. Тянемся вперед.", type: "jump" },
      { name: "Семенящий бег", desc: "Мелкие шаги с расслабленной стопой и высокой частотой.", type: "run" },
      { name: "Выпады в движении", desc: "Широкий шаг, колено сзади почти касается земли.", type: "slow" },
      { name: "Бег на прямых ногах", desc: "Приземление на переднюю часть стопы, ноги 'ножницы'.", type: "run" }
  ];

  const gpp = [
      { name: "Планка", sets: "3 x 45 сек", desc: "Укрепление кора. Спина ровная, таз не проваливаем.", type: "slow" },
      { name: "Боковая планка", sets: "3 x 30 сек", desc: "Косые мышцы. Держим линию тела.", type: "slow" },
      { name: "Приседания", sets: "3 x 20", desc: "Базовая сила ног. Колени не выходят за носки.", type: "slow" },
      { name: "Выпады назад", sets: "3 x 15", desc: "Акцент на ягодицы. Корпус держим ровно.", type: "slow" },
      { name: "Подъемы на носки", sets: "3 x 20", desc: "Укрепление икр и ахилла. Делать плавно.", type: "slow" },
      { name: "Берпи", sets: "3 x 12", desc: "Общая выносливость и взрывная сила.", type: "jump" },
      { name: "Ягодичный мостик", sets: "3 x 20", desc: "Задняя поверхность бедра.", type: "slow" },
      { name: "Отжимания", sets: "3 x 15", desc: "Плечевой пояс и грудь.", type: "slow" },
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
          <div className="grid grid-cols-1 gap-3">
              {gpp.map((ex, i) => (
                  <div key={i} className="group bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50 hover:bg-zinc-800 transition-colors flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                          <AnimatedExerciseIcon type={ex.type} />
                          <div>
                            <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{ex.name}</div>
                            <div className="text-xs text-zinc-400">{ex.desc}</div>
                          </div>
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
                  <div key={i} className="group bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50 hover:bg-zinc-800 transition-colors flex items-center gap-4 cursor-pointer">
                      <AnimatedExerciseIcon type={drill.type} />
                      <div>
                        <div className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{drill.name}</div>
                        <div className="text-sm text-zinc-400 leading-snug">{drill.desc}</div>
                      </div>
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
  const [typeFilter, setTypeFilter] = useState<'all' | 'road' | 'trail' | 'mountain'>('all');

  const races = [
    { id: 1, title: "Алматы Марафон", date: "29 Сентября 2024", loc: "Алматы", dist: "10k, 21k, 42k", image: "bg-gradient-to-br from-green-500 to-emerald-700", type: 'road' },
    { id: 2, title: "Astana Marathon", date: "08 Сентября 2024", loc: "Астана", dist: "10k, 42k", image: "bg-gradient-to-br from-blue-400 to-blue-600", type: 'road' },
    { id: 3, title: "Tengri Ultra", date: "Май 2025", loc: "Или, Алматинская обл.", dist: "15k, 35k, 70k", image: "bg-gradient-to-br from-orange-500 to-red-600", type: 'trail' },
    { id: 4, title: "Irbis Race", date: "Август 2025", loc: "Заилийский Алатау", dist: "21k, 42k, Skyrace", image: "bg-gradient-to-br from-zinc-600 to-zinc-800", type: 'mountain' },
    { id: 5, title: "Turkistan Marathon", date: "Октябрь 2024", loc: "Туркестан", dist: "10k, 21k, 42k", image: "bg-gradient-to-br from-cyan-500 to-blue-500", type: 'road' },
    { id: 6, title: "Almaty Half Marathon", date: "Апрель 2025", loc: "Алматы", dist: "10k, 21k", image: "bg-gradient-to-br from-green-400 to-teal-500", type: 'road' },
    { id: 7, title: "Winter Run", date: "Февраль 2025", loc: "Алматы", dist: "10k", image: "bg-gradient-to-br from-sky-300 to-blue-400", type: 'road' },
    { id: 8, title: "City Run", date: "Июнь 2025", loc: "Алматы", dist: "5k, 10k", image: "bg-gradient-to-br from-yellow-400 to-orange-500", type: 'road' },
    { id: 9, title: "Tau Jarys", date: "Июнь 2025", loc: "Шымбулак", dist: "12k, 25k", image: "bg-gradient-to-br from-stone-500 to-stone-700", type: 'mountain' },
    { id: 10, title: "Amangeldy Race", date: "Октябрь 2025", loc: "Пик Амангельды", dist: "Vertical KM", image: "bg-gradient-to-br from-gray-600 to-black", type: 'mountain' },
    { id: 11, title: "Race Nation", date: "Май 2025", loc: "Алматы", dist: "5k, 10k + Obstacles", image: "bg-gradient-to-br from-red-600 to-red-800", type: 'trail' },
    { id: 12, title: "Burabay Trail", date: "Июль 2025", loc: "Боровое", dist: "10k, 21k", image: "bg-gradient-to-br from-emerald-600 to-green-800", type: 'trail' },
  ];

  const filteredRaces = races.filter(r => typeFilter === 'all' || r.type === typeFilter);

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

      {/* Filters */}
      <div className="flex items-center justify-end mb-4 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
           <FunnelIcon className="w-5 h-5 text-zinc-500 mr-2" />
           <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="bg-zinc-800 text-sm text-white border-none rounded px-3 py-1 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
                <option value="all">Все типы</option>
                <option value="road">Асфальт / Шоссе</option>
                <option value="trail">Трейл / Пересеченка</option>
                <option value="mountain">Горный / Skyrunning</option>
           </select>
      </div>

      <div className="grid gap-4">
        {filteredRaces.map(item => (
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
                    <div className="mb-2">
                        {item.type === 'road' && <span className="text-[10px] font-bold bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50">ШОССЕ</span>}
                        {item.type === 'trail' && <span className="text-[10px] font-bold bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded border border-orange-900/50">ТРЕЙЛ</span>}
                        {item.type === 'mountain' && <span className="text-[10px] font-bold bg-zinc-700/50 text-zinc-300 px-2 py-0.5 rounded border border-zinc-600">ГОРЫ</span>}
                    </div>
                    <div className="font-mono text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded inline-block text-sm border border-emerald-900/50">
                        {item.dist}
                    </div>
                </div>
             </div>
          </Card>
        ))}
        {filteredRaces.length === 0 && (
            <div className="text-center text-zinc-500 py-10">
                Забегов такого типа пока нет в календаре.
            </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<View>('profile');
  const [userStats, setUserStats] = useState<UserStats>({
    height: 178,
    weight: 72,
    club: "I Love Running",
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

  const handleJoinClub = (newClub: string) => {
      setUserStats({...userStats, club: newClub});
      alert(`Вы успешно вступили в клуб: ${newClub}`);
  };

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
            { id: 'club', label: 'Клуб', icon: UserGroupIcon },
            { id: 'chat', label: 'Чат Клуба', icon: ChatBubbleLeftRightIcon },
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
            v2.3.0 KZ Edition
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
            {activeTab === 'profile' && <ProfileView stats={userStats} setStats={setUserStats} />}
            {activeTab === 'club' && <ClubView currentClub={userStats.club} onJoin={handleJoinClub} />}
            {activeTab === 'chat' && <ChatView clubName={userStats.club} />}
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
                <NavButton active={activeTab === 'club'} onClick={() => setActiveTab('club')} icon={UserGroupIcon} label="Клуб" />
                <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={ChatBubbleLeftRightIcon} label="Чат" />
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
