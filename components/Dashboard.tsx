import React, { useState } from 'react';
import { Task, Priority, Category, SubTask } from '../types';
import { Play, CheckCircle, Wand2, MoreVertical, Briefcase, User, ChevronRight, BrainCircuit, Clock } from './Icons';
import { breakDownTaskAI } from '../services/geminiService';

interface DashboardProps {
  tasks: Task[];
  onStartFocus: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, onStartFocus, onCompleteTask, onUpdateTask }) => {
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);

  // Filter tasks
  const activeTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    const priorityOrder = { [Priority.A]: 0, [Priority.B]: 1, [Priority.C]: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => b.createdAt - a.createdAt);

  const handleBreakDown = async (task: Task) => {
    setBreakingDownId(task.id);
    const subTasksText = await breakDownTaskAI(task.title);
    
    const newSubTasks: SubTask[] = subTasksText.map((st, idx) => ({
      id: `${task.id}-sub-${Date.now()}-${idx}`,
      title: st,
      completed: false
    }));

    onUpdateTask({ ...task, subTasks: newSubTasks });
    setBreakingDownId(null);
  };

  const toggleSubTask = (task: Task, subTaskId: string) => {
    const updatedSubTasks = task.subTasks.map(st => 
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subTasks: updatedSubTasks });
  };

  const handleTimeChange = (task: Task, newTime: number) => {
      if (newTime > 0) {
          onUpdateTask({ ...task, estimatedMinutes: newTime });
      }
  }

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.A: return 'bg-red-500';
      case Priority.B: return 'bg-amber-500';
      case Priority.C: return 'bg-blue-400';
      default: return 'bg-slate-400';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <BrainCircuit className="text-indigo-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Todo limpio</h2>
        <p className="text-slate-500 max-w-xs">Tu mente está despejada. Añade una tarea rápida para empezar tu flujo.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-2 px-4 space-y-4">
        <header className="mb-6 mt-4">
            <h1 className="text-2xl font-bold text-slate-900">Mis Tareas</h1>
            <p className="text-slate-500 text-sm">Prioriza y conquista tu día.</p>
        </header>

      {/* Active Tasks */}
      {activeTasks.length === 0 && completedTasks.length > 0 && (
         <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-center mb-8">
            ¡Buen trabajo! Has completado todas tus tareas activas.
         </div>
      )}

      {activeTasks.map((task) => (
        <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Priority Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getPriorityColor(task.priority)}`} />
            
            <div className="flex justify-between items-start pl-3">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            task.category === Category.WORK ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                            {task.category === Category.WORK ? 'Trabajo' : 'Personal'}
                        </span>
                        
                        <div className="flex items-center gap-1 group/time cursor-text">
                            <Clock size={10} className="text-slate-400" />
                            <input 
                                type="number" 
                                value={task.estimatedMinutes}
                                onChange={(e) => handleTimeChange(task, parseInt(e.target.value) || 0)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 text-xs text-slate-500 font-mono bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none p-0 text-center"
                            />
                            <span className="text-xs text-slate-400 font-mono -ml-1">min</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 leading-snug truncate">{task.title}</h3>
                </div>
                
                <button 
                    onClick={() => onStartFocus(task)}
                    className="flex-shrink-0 bg-slate-900 text-white p-3 rounded-full hover:bg-slate-700 active:scale-95 transition-all shadow-md"
                >
                    <Play size={20} fill="currentColor" />
                </button>
            </div>

            {/* Subtasks Section */}
            {task.subTasks.length > 0 && (
                <div className="mt-4 pl-3 space-y-2 border-t border-slate-50 pt-3">
                    {task.subTasks.map(st => (
                        <div key={st.id} onClick={() => toggleSubTask(task, st.id)} className="flex items-center gap-3 cursor-pointer group/item">
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                 st.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover/item:border-emerald-400'
                             }`}>
                                 {st.completed && <CheckCircle size={10} className="text-white" />}
                             </div>
                             <span className={`text-sm ${st.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                 {st.title}
                             </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions Footer */}
            <div className="mt-4 pl-3 flex items-center justify-between">
                {task.subTasks.length === 0 && (
                    <button 
                        onClick={() => handleBreakDown(task)}
                        disabled={breakingDownId === task.id}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        <Wand2 size={12} />
                        {breakingDownId === task.id ? 'Analizando...' : 'Dividir tarea (IA)'}
                    </button>
                )}
                
                <div className="flex gap-2 ml-auto">
                    <button onClick={() => onCompleteTask(task.id)} className="text-xs font-medium text-slate-400 hover:text-emerald-600 px-2 py-1">
                        Hecho
                    </button>
                </div>
            </div>
        </div>
      ))}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="pt-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Completadas</h2>
            <div className="space-y-3 opacity-75">
                {completedTasks.map(task => (
                    <div key={task.id} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 text-emerald-500">
                                <CheckCircle size={24} fill="currentColor" className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-medium line-through truncate">{task.title}</span>
                                <span className="text-xs text-slate-400">
                                    {task.category === Category.WORK ? 'Trabajo' : 'Personal'} • {task.estimatedMinutes} min
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;