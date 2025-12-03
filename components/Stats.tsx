import React, { useState, useMemo } from 'react';
import { CompletedSession, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Briefcase, User, Calendar, History, Clock } from './Icons';

interface StatsProps {
  history: CompletedSession[];
}

type TimeRange = 'day' | 'week' | 'month';

const Stats: React.FC<StatsProps> = ({ history }) => {
  const [range, setRange] = useState<TimeRange>('week');

  const filteredHistory = useMemo(() => {
    const now = new Date();
    // Start of today (00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return history.filter(h => {
      const t = h.completedAt;
      if (range === 'day') {
        return t >= startOfToday;
      } else if (range === 'week') {
         // Last 7 days including today
         const sevenDaysAgo = startOfToday - (6 * 24 * 60 * 60 * 1000);
         return t >= sevenDaysAgo;
      } else {
         // Last 30 days
         const thirtyDaysAgo = startOfToday - (29 * 24 * 60 * 60 * 1000);
         return t >= thirtyDaysAgo;
      }
    }).sort((a, b) => b.completedAt - a.completedAt); // Newest first
  }, [history, range]);

  // Calculate totals based on filtered view
  const totalMinutes = filteredHistory.reduce((acc, sess) => acc + sess.durationMinutes, 0);
  const workMinutes = filteredHistory.filter(h => h.category === Category.WORK).reduce((acc, h) => acc + h.durationMinutes, 0);
  const personalMinutes = filteredHistory.filter(h => h.category === Category.PERSONAL).reduce((acc, h) => acc + h.durationMinutes, 0);

  const pieData = [
    { name: 'Trabajo', value: workMinutes, color: '#4f46e5' }, // Indigo 600
    { name: 'Personal', value: personalMinutes, color: '#10b981' }, // Emerald 500
  ].filter(d => d.value > 0);

  // Group history by date string for the list view
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: CompletedSession[] } = {};
    filteredHistory.forEach(session => {
        const date = new Date(session.completedAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
        
        // Humanize labels
        if (date.toDateString() === today.toDateString()) dateKey = "Hoy";
        else if (date.toDateString() === yesterday.toDateString()) dateKey = "Ayer";

        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(session);
    });
    return groups;
  }, [filteredHistory]);

  return (
    <div className="pb-24 pt-2 px-4 space-y-6 animate-fade-in max-w-md mx-auto">
      <header className="mt-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Historial</h1>
            <p className="text-slate-500 text-sm">Tu balance y archivo de tareas.</p>
          </div>
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-medium">
              <button 
                onClick={() => setRange('day')}
                className={`px-3 py-1.5 rounded-md transition-all ${range === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                1D
              </button>
              <button 
                onClick={() => setRange('week')}
                className={`px-3 py-1.5 rounded-md transition-all ${range === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                7D
              </button>
              <button 
                onClick={() => setRange('month')}
                className={`px-3 py-1.5 rounded-md transition-all ${range === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                30D
              </button>
          </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-indigo-500" />
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tiempo Foco</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{totalMinutes}<span className="text-sm font-normal text-slate-400 ml-1">min</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
                <History size={16} className="text-emerald-500" />
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tareas</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{filteredHistory.length}</p>
        </div>
      </div>

      {/* Balance Chart (Only if data exists) */}
      {totalMinutes > 0 ? (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
            <div className="h-32 w-32 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={pieData}
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                     <span className="text-lg font-bold text-slate-800">{Math.round((workMinutes / totalMinutes) * 100) || 0}%</span>
                     <span className="text-[10px] text-slate-400 font-medium uppercase">Trabajo</span>
                </div>
            </div>
            
            <div className="flex-1 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Balance del periodo</h3>
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-indigo-600 font-medium flex items-center gap-1"><Briefcase size={10} /> Trabajo</span>
                        <span className="text-slate-500">{workMinutes} min</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${(workMinutes / totalMinutes) * 100}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-600 font-medium flex items-center gap-1"><User size={10} /> Personal</span>
                        <span className="text-slate-500">{personalMinutes} min</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(personalMinutes / totalMinutes) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
          <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-400 text-sm border border-slate-100 border-dashed">
              No hay actividad registrada en este periodo.
          </div>
      )}

      {/* History Log */}
      <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar size={16} />
              Archivo de Actividad
          </h3>

          {Object.keys(groupedHistory).length === 0 && (
              <p className="text-slate-400 text-sm italic pl-2">Nada por aquí aún...</p>
          )}

          {Object.keys(groupedHistory).map(dateKey => (
              <div key={dateKey} className="animate-slide-up">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-slate-50 py-1 z-10">{dateKey}</h4>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                      {groupedHistory[dateKey].map(session => (
                          <div key={session.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      session.category === Category.WORK ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                  }`}>
                                      {session.category === Category.WORK ? <Briefcase size={14} /> : <User size={14} />}
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-medium text-slate-800 truncate">{session.taskTitle}</p>
                                      <p className="text-[10px] text-slate-400">
                                          {new Date(session.completedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                  </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                  <span className="text-sm font-bold text-slate-700">{session.durationMinutes}</span>
                                  <span className="text-[10px] text-slate-400 ml-0.5">min</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Stats;