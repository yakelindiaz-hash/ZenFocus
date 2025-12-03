import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, Priority } from '../types';
import { Pause, Play, CheckCircle, BrainCircuit, Plus } from './Icons';
import { getMotivationalQuote } from '../services/geminiService';

interface FocusTimerProps {
  task: Task;
  onComplete: (taskId: string, minutesSpent: number) => void;
  onCancel: () => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ task, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(task.estimatedMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(task.estimatedMinutes * 60);
  const [quote, setQuote] = useState<string>("Concéntrate en el ahora.");

  // Load quote on mount
  useEffect(() => {
    getMotivationalQuote().then(setQuote);
  }, []);

  const playBeep = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.8);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const adjustTime = (minutes: number) => {
    const newTime = Math.max(0, timeLeft + minutes * 60);
    setTimeLeft(newTime);
    // If we are adding time to the initial estimate (e.g. extending session), update initialTime too for progress bar consistency
    if (newTime > initialTime) {
        setInitialTime(newTime);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playBeep();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  const strokeDasharray = 2 * Math.PI * 120; // Radius 120
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  const handleFinish = () => {
    const minutesSpent = Math.ceil((initialTime - timeLeft) / 60);
    onComplete(task.id, minutesSpent > 0 ? minutesSpent : 1);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-6 px-4 animate-fade-in text-center">
      <div className="w-full flex justify-between items-start">
        <button onClick={onCancel} className="text-slate-400 text-sm font-medium hover:text-slate-600">
          Cancelar
        </button>
        <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-mono">
           MODO ENFOQUE
        </div>
      </div>

      <div className="flex flex-col items-center flex-1 justify-center space-y-8 w-full">
        
        <div className="space-y-2 max-w-xs mx-auto">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
             task.priority === Priority.A ? 'bg-red-100 text-red-600' : 
             task.priority === Priority.B ? 'bg-amber-100 text-amber-600' : 
             'bg-blue-100 text-blue-600'
          }`}>
             PRIORIDAD {task.priority}
          </span>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">{task.title}</h2>
          <p className="text-sm text-slate-500 italic">"{quote}"</p>
        </div>

        {/* Circular Timer */}
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-72 h-72">
            <circle
              cx="144"
              cy="144"
              r="120"
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="144"
              cy="144"
              r="120"
              stroke={isActive ? "#4f46e5" : "#94a3b8"} // Indigo or Slate
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-6xl font-bold text-slate-800 tabular-nums tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-slate-400 text-sm font-medium mt-1">minutos restantes</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6">
            <button 
                onClick={() => adjustTime(-5)}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                title="-5 min"
            >
                -5
            </button>

            <button
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
                isActive 
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
                }`}
            >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            <button 
                onClick={() => adjustTime(5)}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                title="+5 min"
            >
                +5
            </button>
        </div>
      </div>

      <div className="w-full max-w-md">
        <button
          onClick={handleFinish}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle size={24} />
          <span>Marcar Completada</span>
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;