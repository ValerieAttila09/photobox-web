'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Text } from 'react-konva';
import { FrameTheme, PhotoFilter } from '@/types/photobox';

interface PhotoboxCanvasProps {
  photos: string[]; // Base64 data URL dari 3 foto
  theme: FrameTheme;
  filter: PhotoFilter;
  onStageReady?: (stageRef: any) => void;
}

// Konfigurasi Warna Theme Frame
const THEME_COLORS: Record<FrameTheme, { bg: string; text: string; accent: string }> = {
  'classic-white': { bg: '#FFFFFF', text: '#1E293B', accent: '#E2E8F0' },
  'dark-mode': { bg: '#0F172A', text: '#F8FAFC', accent: '#334155' },
  'pastel-pink': { bg: '#FCE7F3', text: '#831843', accent: '#FBCFE8' },
  'retro-yellow': { bg: '#FEF3C7', text: '#78350F', accent: '#FDE68A' },
  'cyber-blue': { bg: '#E0F2FE', text: '#0C4A6E', accent: '#BAE6FD' },
};

export function PhotoboxCanvas({ photos, theme, filter, onStageReady }: PhotoboxCanvasProps) {
  const stageRef = useRef<any>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  // Dimensions Canvas Photobox Strip
  const canvasWidth = 360;
  const canvasHeight = 900;
  const photoWidth = 300;
  const photoHeight = 225; // Ratio 4:3
  const paddingX = (canvasWidth - photoWidth) / 2; // 30px
  const startY = 40;
  const gapY = 25;

  // Load HTML Image Elements dari Base64
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    photos.forEach((src, idx) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;
      img.onload = () => {
        loadedImages[idx] = img;
        loadedCount++;
        if (loadedCount === photos.length) {
          setImages([...loadedImages]);
        }
      };
    });
  }, [photos]);

  useEffect(() => {
    if (stageRef.current && onStageReady) {
      onStageReady(stageRef.current);
    }
  }, [onStageReady, images]);

  // CSS Filter String berdasarkan Pilihan User
  const getFilterStyle = (f: PhotoFilter) => {
    switch (f) {
      case 'grayscale': return 'grayscale(100%)';
      case 'sepia': return 'sepia(80%)';
      case 'vintage': return 'contrast(120%) brightness(90%) sepia(30%)';
      case 'warm': return 'sepia(20%) saturate(140%)';
      case 'cool': return 'hue-rotate(30deg) saturate(110%)';
      default: return 'none';
    }
  };

  const currentTheme = THEME_COLORS[theme] || THEME_COLORS['classic-white'];

  return (
    <div className="flex flex-col items-center shadow-2xl rounded-xl overflow-hidden border border-gray-700 bg-gray-900 p-2">
      <Stage
        width={canvasWidth}
        height={canvasHeight}
        ref={stageRef}
        className="rounded-lg overflow-hidden"
      >
        <Layer>
          {/* Background Frame Strip */}
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={currentTheme.bg}
          />

          {/* Render 3 Foto */}
          {images.map((imgObj, index) => {
            const yPos = startY + index * (photoHeight + gapY);
            return (
              <React.Fragment key={index}>
                {/* Frame Border Foto */}
                <Rect
                  x={paddingX - 4}
                  y={yPos - 4}
                  width={photoWidth + 8}
                  height={photoHeight + 8}
                  fill={currentTheme.accent}
                  cornerRadius={6}
                />
                {/* Objek Foto */}
                <KonvaImage
                  image={imgObj}
                  x={paddingX}
                  y={yPos}
                  width={photoWidth}
                  height={photoHeight}
                  cornerRadius={4}
                  // Menerapkan Efek Filter Visual
                  filters={[]}
                  onDraw={(canvas: any) => {
                    const ctx = canvas.getContext();
                    if (ctx) {
                      ctx.filter = getFilterStyle(filter);
                    }
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Footer Stamp / Branding Photobox */}
          <Text
            text="✦ PHOTOBOX MEMORIES ✦"
            x={0}
            y={canvasHeight - 80}
            width={canvasWidth}
            align="center"
            fontSize={16}
            fontStyle="bold"
            fill={currentTheme.text}
            fontFamily="sans-serif"
          />
          <Text
            text={new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            x={0}
            y={canvasHeight - 50}
            width={canvasWidth}
            align="center"
            fontSize={12}
            fill={currentTheme.text}
            opacity={0.7}
            fontFamily="sans-serif"
          />
        </Layer>
      </Stage>
    </div>
  );
}