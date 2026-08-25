'use client';

import React from 'react';
import { FrameTheme, PhotoFilter } from '@/types/photobox';
import { Palette, Sparkles } from 'lucide-react';

interface FilterControlsProps {
  currentTheme: FrameTheme;
  currentFilter: PhotoFilter;
  onThemeChange: (theme: FrameTheme) => void;
  onFilterChange: (filter: PhotoFilter) => void;
  onAddSticker: (emoji: string) => void;
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
  onAddSticker,
}: FilterControlsProps) {
  const stickers = ['✨', '💖', '⭐', '🌈', '📸', '🦋'];
  return (
    <div className="photobox-panel flex flex-col gap-6 w-full max-w-md bg-white p-6">
      {/* Pilihan Warna Frame */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-black uppercase tracking-wide text-[var(--pb-ink)]">
          <Palette className="w-4 h-4 text-[var(--pb-coral)]" />
          <span>Pilih Warna Bingkai</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`h-10 rounded-xl border-2 transition-all flex items-center justify-center ${t.colorBg} ${
                currentTheme === t.id
                  ? 'border-[var(--pb-ink)] scale-105 shadow-[3px_3px_0_var(--pb-ink)] ring-2 ring-[var(--pb-pink)]'
                  : 'border-gray-300 hover:scale-95 opacity-80'
              }`}
              title={t.label}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-black uppercase tracking-wide text-[var(--pb-ink)]">
          <Sparkles className="w-4 h-4 text-[var(--pb-coral)]" />
          <span>Drag & drop sticker</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {stickers.map((emoji) => (
            <button
              key={emoji}
              type="button"
              draggable
              onDragStart={(event) => event.dataTransfer.setData('text/plain', emoji)}
              onClick={() => onAddSticker(emoji)}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-50 text-xl transition-transform hover:-translate-y-1 hover:bg-[var(--pb-lime)]"
              title={`Tambah ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Pilihan Filter Foto */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-black uppercase tracking-wide text-[var(--pb-ink)]">
          <Sparkles className="w-4 h-4 text-[var(--pb-coral)]" />
          <span>Efek Filter Foto</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                currentFilter === f.id
                  ? 'bg-[var(--pb-pink)] text-[var(--pb-ink)] border-[var(--pb-ink)] shadow-[3px_3px_0_var(--pb-ink)]'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-[var(--pb-lime)]'
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