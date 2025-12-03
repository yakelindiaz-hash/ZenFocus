import React, { useState } from 'react';
import { Priority, Category } from '../types';
import { X, Briefcase, User, Clock } from './Icons';

interface QuickAddProps {
  onAdd: (title: string, category: Category, priority: Priority, minutes: number) => void;
  onClose: () => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.B);
  const [category, setCategory] = useState<Category>(Category.WORK);
  const [minutes, setMinutes] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, category, priority, minutes);
    onClose();
  };

  const timePresets = [15, 25, 45, 60];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Añadir Rápido</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              autoFocus
              placeholder="¿Qué necesitas hacer?"
              className="w-full text-lg border-b-2 border-slate-200 py-2 focus:outline-none focus:border-indigo-500 bg-transparent placeholder-slate-400 text-slate-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Priority Selection */}
          <div className="flex gap-2">
            {[Priority.A, Priority.B, Priority.C].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  priority === p
                    ? p === Priority.A ? 'bg-red-100 text-red-700 ring-2 ring-red-500' 
                      : p === Priority.B ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                      : 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {p === Priority.A ? 'Crítico (A)' : p === Priority.B ? 'Importante (B)' : 'Opcional (C)'}
              </button>
            ))}
          </div>

          {/* Category & Time Row */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <div className="flex-1">
                <label className="text-xs font-semibold text-slate-400 mb-1 block uppercase">Categoría</label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                    type="button"
                    onClick={() => setCategory(Category.WORK)}
                    className={`flex-1 flex justify-center items-center py-2 rounded-md text-sm ${
                        category === Category.WORK ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                    }`}
                    >
                    <Briefcase size={16} className="mr-1" /> Trab
                    </button>
                    <button
                    type="button"
                    onClick={() => setCategory(Category.PERSONAL)}
                    className={`flex-1 flex justify-center items-center py-2 rounded-md text-sm ${
                        category === Category.PERSONAL ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'
                    }`}
                    >
                    <User size={16} className="mr-1" /> Pers
                    </button>
                </div>
                </div>

                <div className="w-1/3">
                <label className="text-xs font-semibold text-slate-400 mb-1 block uppercase">Minutos</label>
                <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                    type="number"
                    min="5"
                    step="5"
                    value={minutes}
                    onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-100 rounded-lg py-2 pl-9 pr-2 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                </div>
            </div>

            {/* Time Presets */}
            <div className="flex justify-between gap-2">
                {timePresets.map(m => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMinutes(m)}
                        className={`flex-1 py-1.5 text-xs rounded-md border ${
                            minutes === m 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {m}m
                    </button>
                ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none mt-2"
          >
            Añadir Tarea
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickAdd;