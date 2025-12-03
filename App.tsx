import React, { useState, useEffect } from 'react';
import { Task, Category, Priority, AppView, CompletedSession } from './types';
import Dashboard from './components/Dashboard';
import QuickAdd from './components/QuickAdd';
import FocusTimer from './components/FocusTimer';
import Stats from './components/Stats';
import { Home, BarChart2, Plus } from './components/Icons';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<CompletedSession[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('zenfocus_tasks');
    const savedHistory = localStorage.getItem('zenfocus_history');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('zenfocus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('zenfocus_history', JSON.stringify(history));
  }, [history]);

  const addTask = (title: string, category: Category, priority: Priority, minutes: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      category,
      priority,
      estimatedMinutes: minutes,
      completed: false,
      createdAt: Date.now(),
      subTasks: []
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const completeTask = (taskId: string, minutesSpent?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Add to history if time was spent
    if (minutesSpent && minutesSpent > 0) {
      const session: CompletedSession = {
        id: Date.now().toString(),
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        durationMinutes: minutesSpent,
        completedAt: Date.now()
      };
      setHistory(prev => [...prev, session]);
    }

    // Mark as completed instead of removing, so it shows in the "Completed" list
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    
    // Reset view
    setView(AppView.DASHBOARD);
    setActiveTask(null);
  };

  const startFocus = (task: Task) => {
    setActiveTask(task);
    setView(AppView.FOCUS);
  };

  // View Routing
  const renderView = () => {
    switch (view) {
      case AppView.FOCUS:
        if (!activeTask) return <div onClick={() => setView(AppView.DASHBOARD)}>Error: No task selected</div>;
        return (
          <FocusTimer 
            task={activeTask} 
            onComplete={completeTask}
            onCancel={() => setView(AppView.DASHBOARD)}
          />
        );
      case AppView.ANALYTICS:
        return <Stats history={history} />;
      case AppView.DASHBOARD:
      default:
        return (
          <Dashboard 
            tasks={tasks} 
            onStartFocus={startFocus} 
            onCompleteTask={(id) => completeTask(id, 0)} // Quick complete (0 min tracked)
            onUpdateTask={updateTask}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans text-slate-800">
      <div className="w-full max-w-md bg-white shadow-2xl min-h-screen relative flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative z-0">
          {renderView()}
        </main>

        {/* Floating Action Button (Only on Dashboard) */}
        {view === AppView.DASHBOARD && (
          <div className="absolute bottom-24 right-6 z-20">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="bg-slate-900 text-white w-14 h-14 rounded-full shadow-xl shadow-slate-300 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <Plus size={28} />
            </button>
          </div>
        )}

        {/* Bottom Navigation (Hidden in Focus Mode) */}
        {view !== AppView.FOCUS && (
          <nav className="bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-between items-center absolute bottom-0 w-full z-10 pb-6">
            <button 
              onClick={() => setView(AppView.DASHBOARD)}
              className={`flex flex-col items-center gap-1 transition-colors ${view === AppView.DASHBOARD ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Home size={24} strokeWidth={view === AppView.DASHBOARD ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Tareas</span>
            </button>
            
            <button 
              onClick={() => setView(AppView.ANALYTICS)}
              className={`flex flex-col items-center gap-1 transition-colors ${view === AppView.ANALYTICS ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <BarChart2 size={24} strokeWidth={view === AppView.ANALYTICS ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Progreso</span>
            </button>
          </nav>
        )}

        {/* Modals */}
        {showQuickAdd && (
          <QuickAdd 
            onAdd={addTask} 
            onClose={() => setShowQuickAdd(false)} 
          />
        )}
      </div>
    </div>
  );
}