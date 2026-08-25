'use client';

import React, { useState, useCallback, useRef } from 'react';
import { CameraFeed } from '@/components/CameraFeed';
import { CountdownOverlay } from '@/components/CountdownOverlay';
import { PhotoboxCanvas } from '@/components/PhotoboxCanvas';
import { FilterControls } from '@/components/FilterControls';
import { captureVideoFrame, downloadCanvasImage } from '@/utils/canvasHelpers';
import { AppStage, FrameTheme, PhotoFilter } from '@/types/photobox';
import confetti from 'canvas-confetti';
import { Camera, Download, RefreshCw, Sparkles } from 'lucide-react';
import { useMediaPipe } from '@/hooks/useMediaPipe';

export default function PhotoboxApp() {
  const [stage, setStage] = useState<AppStage>('START');
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Customization State
  const [theme, setTheme] = useState<FrameTheme>('classic-white');
  const [filter, setFilter] = useState<PhotoFilter>('none');

  const stageRef = useRef<any>(null);
  const isProcessingGesture = useRef(false);

  // Handler Memotret Foto
  const takeSnapshot = useCallback(() => {
    if (!videoRef.current) return;

    // Trigger Efek Flash Visual
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const photoData = captureVideoFrame(videoRef.current);
    if (photoData) {
      setPhotos((prev) => {
        const updated = [...prev, photoData];
        // Jika sudah terkumpul 3 foto, pindah ke halaman hasil
        if (updated.length >= 3) {
          setTimeout(() => {
            setStage('RESULT');
            stopCamera();
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }, 600);
        } else {
          // Jika belum 3 foto, bersiap untuk gestur selanjutnya
          setTimeout(() => {
            isProcessingGesture.current = false;
            setStage('SCANNING');
          }, 1500);
        }
        return updated;
      });
    }
  }, []);

  // Handler Deteksi Gestur Jempol dari MediaPipe
  const handleGestureDetected = useCallback(
    (gestureName: string) => {
      if (
        gestureName === 'Thumb_Up' &&
        stage === 'SCANNING' &&
        !isProcessingGesture.current &&
        photos.length < 3
      ) {
        isProcessingGesture.current = true;
        setStage('COUNTDOWN');
        setCountdown(3);

        // Timer Countdown 3, 2, 1
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              setCountdown(null);
              takeSnapshot();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    },
    [stage, photos.length, takeSnapshot]
  );

  // Inisialisasi Hook MediaPipe
  const { videoRef, isReady, cameraActive, error, stopCamera } = useMediaPipe({
    active: stage === 'SCANNING' || stage === 'COUNTDOWN',
    onGestureDetected: handleGestureDetected,
  });

  // Mulai Sesi Photobox
  const handleStartSession = async () => {
    setPhotos([]);
    setStage('SCANNING');
    isProcessingGesture.current = false;
  };

  // Reset Foto / Foto Ulang
  const handleReset = () => {
    setPhotos([]);
    handleStartSession();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 md:p-8">
      {/* Header Branding */}
      <header className="flex flex-col items-center gap-2 mb-6">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MediaPipe AI Photobox</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          SnapBox AI
        </h1>
      </header>

      {/* Area Konten Utama */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center">
        {/* STAGE 1: Halaman Awal (START) */}
        {stage === 'START' && (
          <div className="flex flex-col items-center text-center max-w-md gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <Camera className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Siap untuk Berfoto?</h2>
              <p className="text-sm text-slate-400">
                Cukup tunjukkan gestur <span className="text-indigo-400 font-semibold">Mantap (Thumbs Up) 👍</span> ke kamera untuk memulai pemotretan otomatis 3x.
              </p>
            </div>
            <button
              onClick={handleStartSession}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              Mulai Kamera
            </button>
          </div>
        )}

        {/* STAGE 2: Area Pemotretan (SCANNING / COUNTDOWN) */}
        {(stage === 'SCANNING' || stage === 'COUNTDOWN') && (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative w-full flex justify-center">
              <CameraFeed
                videoRef={videoRef}
                isReady={isReady}
                cameraActive={cameraActive}
                error={error}
                isTriggered={stage === 'COUNTDOWN'}
                photoCount={photos.length}
                maxPhotos={3}
                isFlashing={isFlashing}
              />
              <CountdownOverlay count={countdown} />
            </div>
          </div>
        )}

        {/* STAGE 3: Halaman Hasil Photobox (RESULT) */}
        {stage === 'RESULT' && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
            {/* Canvas Render Strip Photobox */}
            <PhotoboxCanvas
              photos={photos}
              theme={theme}
              filter={filter}
              onStageReady={(ref) => (stageRef.current = ref)}
            />

            {/* Sidebar Panel Kontrol Filter & Unduh */}
            <div className="flex flex-col items-center gap-6">
              <FilterControls
                currentTheme={theme}
                currentFilter={filter}
                onThemeChange={setTheme}
                onFilterChange={setFilter}
              />

              {/* Tombol Aksi Download & Reset */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => downloadCanvasImage(stageRef.current, 'my-photobox.png')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Unduh PNG
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition-all border border-slate-700 active:scale-95 text-sm"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  Foto Ulang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-xs text-slate-500 text-center">
        Built with Next.js, React Konva, and Google MediaPipe Tasks Vision.
      </footer>
    </main>
  );
}