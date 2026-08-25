'use client';

import React from 'react';
import { FrameTheme, PhotoFilter } from '@/types/photobox';
import { Palette, Sparkles } from 'lucide-react';

interface FilterControlsProps {
  currentTheme: FrameTheme;
  currentFilter: PhotoFilter;
  onThemeChange: (theme: FrameTheme) => void;
  onFilterChange: (filter: PhotoFilter) => void;
}

const THEMES: { id: FrameTheme; label: string; colorBg: string }[] = [
  { id: 'classic-white', label: 'Classic White', colorBg: 'bg-white' },
  { id: 'dark-mode', label: 'Dark Mode', colorBg: 'bg-slate-900' },
  { id: 'pastel-pink', label: 'Pastel Pink', colorBg: 'bg-pink-200' },
  { id: 'retro-yellow', label: 'Retro Yellow', colorBg: 'bg-amber-100' },
  { id: 'cyber-blue', label: 'Cyber Blue', colorBg: 'bg-sky-200' },
];

const FILTERS: { id: PhotoFilter; label: string }[] = [
  { id: 'none', label: 'Normal' },
  { id: 'grayscale', label: 'B&W' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
];

export function FilterControls({
  currentTheme,
  currentFilter,
  onThemeChange,
  onFilterChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md bg-gray-900/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
      {/* Pilihan Warna Frame */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-200">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span>Pilih Warna Bingkai</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`h-10 rounded-xl border-2 transition-all flex items-center justify-center ${t.colorBg} ${
                currentTheme === t.id
                  ? 'border-indigo-500 scale-105 shadow-lg ring-2 ring-indigo-500/50'
                  : 'border-transparent hover:scale-95 opacity-80'
              }`}
              title={t.label}
            />
          ))}
        </div>
      </div>

      {/* Pilihan Filter Foto */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Efek Filter Foto</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                currentFilter === f.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}