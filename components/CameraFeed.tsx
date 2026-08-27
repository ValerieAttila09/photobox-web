'use client';

import React from 'react';
import { ThumbsUp, Camera, Loader2 } from 'lucide-react';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  cameraActive: boolean;
  error: string | null;
  isTriggered: boolean;
  captureNumber: number;
  maxPhotos?: number;
  isFlashing: boolean;
}

export function CameraFeed({
  videoRef,
  isReady,
  cameraActive,
  error,
  isTriggered,
  captureNumber,
  maxPhotos = 3,
  isFlashing,
}: CameraFeedProps) {
  return (
    <div className="photobox-panel relative w-full max-w-lg aspect-[3/4] bg-black overflow-hidden">
      {/* Stream Video Webcam */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover -scale-x-100" // -scale-x-100 untuk efek cermin
      />

      {/* Efek Flash Saat Memotret */}
      {isFlashing && (
        <div className="absolute inset-0 z-30 bg-white animate-ping opacity-90 pointer-events-none" />
      )}

      {/* Indicator Status Loading MediaPipe / Kamera */}
      {(!isReady || (!cameraActive && !error)) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950/80 text-white gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--pb-pink)]" />
          <p className="text-sm font-bold text-gray-300">
            {!isReady ? 'Memuat Model AI MediaPipe...' : 'Membuka Akses Kamera...'}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-950/90 px-6 text-center text-white gap-3">
          <Camera className="w-10 h-10 text-red-400" />
          <p className="text-sm font-medium text-red-200">{error}</p>
        </div>
      )}

      {/* Overlay Status Deteksi & Progress Foto */}
      {cameraActive && isReady && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          {/* Badge Petunjuk Gestur */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 ${
              isTriggered
                ? 'bg-emerald-500/90 text-white shadow-lg scale-105'
                : 'bg-black/60 text-gray-200 border border-white/20'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isTriggered ? 'animate-bounce' : ''}`} />
            <span>
              {isTriggered ? 'Gestur Terdeteksi! Bersiap...' : 'Tunjukkan Mantap (Thumbs Up) 👍'}
            </span>
          </div>

          {/* Counter Hasil Potret */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>{captureNumber} / {maxPhotos} Foto</span>
          </div>
        </div>
      )}
    </div>
  );
}