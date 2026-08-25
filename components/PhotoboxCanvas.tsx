'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Text } from 'react-konva';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import { FrameTheme, PhotoFilter, PhotoboxSticker } from '@/types/photobox';

function getFilterStyle(filter: PhotoFilter) {
  switch (filter) {
    case 'grayscale': return 'grayscale(100%)';
    case 'sepia': return 'sepia(80%)';
    case 'vintage': return 'contrast(120%) brightness(90%) sepia(30%)';
    case 'warm': return 'sepia(20%) saturate(140%)';
    case 'cool': return 'hue-rotate(30deg) saturate(110%)';
    default: return 'none';
  }
}

interface PhotoboxCanvasProps {
  photos: string[]; // Base64 data URL dari 3 foto
  theme: FrameTheme;
  filter: PhotoFilter;
  stickers: PhotoboxSticker[];
  onAddSticker: (emoji: string, x?: number, y?: number) => void;
  onStickerChange: (id: string, x: number, y: number) => void;
  onStageReady?: (stageRef: KonvaStage) => void;
}

// Konfigurasi Warna Theme Frame
const THEME_COLORS: Record<FrameTheme, { bg: string; text: string; accent: string }> = {
  'classic-white': { bg: '#FFFFFF', text: '#1E293B', accent: '#E2E8F0' },
  'dark-mode': { bg: '#0F172A', text: '#F8FAFC', accent: '#334155' },
  'pastel-pink': { bg: '#FCE7F3', text: '#831843', accent: '#FBCFE8' },
  'retro-yellow': { bg: '#FEF3C7', text: '#78350F', accent: '#FDE68A' },
  'cyber-blue': { bg: '#E0F2FE', text: '#0C4A6E', accent: '#BAE6FD' },
};

export function PhotoboxCanvas({ photos, theme, filter, stickers, onAddSticker, onStickerChange, onStageReady }: PhotoboxCanvasProps) {
  const stageRef = useRef<KonvaStage | null>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  // Dimensions Canvas Photobox Strip
  const canvasWidth = 360;
  const canvasHeight = 1200;
  const photoWidth = 240;
  const photoHeight = 320; // Ratio 3:4
  const paddingX = (canvasWidth - photoWidth) / 2; // 30px
  const startY = 40;
  const gapY = 25;

  // Load HTML Image Elements dari Base64
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    if (photos.length === 0) return;

    photos.forEach((src, idx) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;
      img.onload = () => {
        const filteredCanvas = document.createElement('canvas');
        filteredCanvas.width = img.naturalWidth;
        filteredCanvas.height = img.naturalHeight;
        const context = filteredCanvas.getContext('2d');
        if (!context) return;
        context.filter = getFilterStyle(filter);
        context.drawImage(img, 0, 0);
        const filteredImage = new Image();
        filteredImage.onload = () => {
          loadedImages[idx] = filteredImage;
          loadedCount++;
          if (loadedCount === photos.length) setImages([...loadedImages]);
        };
        filteredImage.src = filteredCanvas.toDataURL('image/png');
      };
    });
  }, [photos, filter]);

  useEffect(() => {
    if (stageRef.current && onStageReady) {
      onStageReady(stageRef.current);
    }
  }, [onStageReady, images]);

  const currentTheme = THEME_COLORS[theme] || THEME_COLORS['classic-white'];

  return (
    <div
      className="photobox-panel flex flex-col items-center overflow-hidden bg-white p-2"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const emoji = event.dataTransfer.getData('text/plain');
        const bounds = event.currentTarget.getBoundingClientRect();
        if (!emoji || !bounds.width) return;
        onAddSticker(
          emoji,
          ((event.clientX - bounds.left) / bounds.width) * canvasWidth,
          ((event.clientY - bounds.top) / bounds.height) * canvasHeight,
        );
      }}
    >
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
                />
              </React.Fragment>
            );
          })}

          {stickers.map((sticker) => (
            <Text
              key={sticker.id}
              text={sticker.emoji}
              x={sticker.x}
              y={sticker.y}
              fontSize={48}
              scaleX={sticker.scale}
              scaleY={sticker.scale}
              draggable
              onDragEnd={(event) => onStickerChange(sticker.id, event.target.x(), event.target.y())}
            />
          ))}

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