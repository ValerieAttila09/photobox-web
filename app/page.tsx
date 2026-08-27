'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraFeed } from '@/components/CameraFeed';
import { CountdownOverlay } from '@/components/CountdownOverlay';
import { PhotoboxCanvas } from '@/components/PhotoboxCanvas';
import { FilterControls } from '@/components/FilterControls';
import { captureVideoFrame, downloadCanvasImage } from '@/utils/canvasHelpers';
import { AppStage, FrameTheme, PhotoFilter, PhotoboxSticker, PhotoCount } from '@/types/photobox';
import type { Stage as KonvaStage } from 'konva/lib/Stage';
import confetti from 'canvas-confetti';
import { Camera, Download, RefreshCw, Sparkles } from 'lucide-react';
import { useMediaPipe } from '@/hooks/useMediaPipe';

export default function PhotoboxApp() {
  const [stage, setStage] = useState<AppStage>('START');
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [captureNumber, setCaptureNumber] = useState(0);

  // Customization State
  const [theme, setTheme] = useState<FrameTheme>('classic-white');
  const [filter, setFilter] = useState<PhotoFilter>('none');
  const [stickers, setStickers] = useState<PhotoboxSticker[]>([]);
  const [photoCount, setPhotoCount] = useState<PhotoCount>(3);

  const stageRef = useRef<KonvaStage | null>(null);
  const isProcessingGesture = useRef(false);
  const takeSnapshotRef = useRef<() => void>(() => {});
  const captureIndexRef = useRef(0);
  const photoCountRef = useRef<PhotoCount>(3);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    photoCountRef.current = photoCount;
  }, [photoCount]);

  // Handler Deteksi Gestur Jempol dari MediaPipe
  const handleGestureDetected = useCallback(
    (gestureName: string) => {
      if (
        gestureName === 'Thumb_Up' &&
        stage === 'SCANNING' &&
        !isProcessingGesture.current &&
        captureIndexRef.current < photoCountRef.current
      ) {
        isProcessingGesture.current = true;
        setStage('COUNTDOWN');
        setCountdown(3);

        setCountdown(3);
      }
    },
    [stage]
  );

  // Inisialisasi Hook MediaPipe
  const { videoRef, isReady, cameraActive, error, stopCamera } = useMediaPipe({
    active: stage === 'SCANNING' || stage === 'COUNTDOWN',
    onGestureDetected: handleGestureDetected,
  });

  // Handler Memotret Foto
  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || captureIndexRef.current >= photoCountRef.current) return;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const photoData = captureVideoFrame(video);
    if (photoData) {
      captureIndexRef.current += 1;
      const capturedCount = captureIndexRef.current;
      setCaptureNumber(capturedCount);
      setPhotos((current) => [...current, photoData]);

      if (capturedCount >= photoCountRef.current) {
        setTimeout(() => {
          setStage('RESULT');
          stopCamera();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }, 600);
      } else {
        setTimeout(() => {
          isProcessingGesture.current = false;
          setStage('SCANNING');
        }, 1500);
      }
    }
  }, [stopCamera, videoRef]);

  useEffect(() => {
    takeSnapshotRef.current = takeSnapshot;
  }, [takeSnapshot]);

  useEffect(() => {
    if (stage !== 'COUNTDOWN' || countdown === null) return;

    countdownTimerRef.current = setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null);
        takeSnapshotRef.current();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [stage, countdown]);

  // Mulai Sesi Photobox
  const handleStartSession = async () => {
    setPhotos([]);
    captureIndexRef.current = 0;
    setCaptureNumber(0);
    photoCountRef.current = photoCount;
    setStage('SCANNING');
    isProcessingGesture.current = false;
  };

  // Reset Foto / Foto Ulang
  const handleReset = () => {
    setPhotos([]);
    setStickers([]);
    handleStartSession();
  };

  const shotOptions: PhotoCount[] = [2, 3, 4];

  const addSticker = (emoji: string, x = 156, y = 560) => {
    setStickers((current) => [...current, {
      id: `${emoji}-${Date.now()}`,
      emoji,
      x,
      y,
      scale: 1,
    }]);
  };

  const moveSticker = (id: string, x: number, y: number) => {
    setStickers((current) => current.map((sticker) => (
      sticker.id === id ? { ...sticker, x, y } : sticker
    )));
  };

  return (
    <main className="photobox-shell min-h-screen text-(--pb-ink) flex flex-col items-center justify-between overflow-hidden px-4 py-5 md:px-8 md:py-7">
      {/* Header Branding */}
      <header className="flex w-full max-w-6xl items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-(--pb-ink) bg-(--pb-lime) shadow-[4px_4px_0_var(--pb-ink)]">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em]">Fujifilm inspired</p>
            <p className="text-sm font-bold">Photobox Studio</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border-2 border-(--pb-ink) bg-white px-4 py-2 text-xs font-black uppercase sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-(--pb-coral)" /> AI photo booth
        </div>
      </header>

      {/* Area Konten Utama */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center">
        {/* STAGE 1: Halaman Awal (START) */}
        {stage === 'START' && (
          <div className="photobox-panel flex flex-col items-center text-center max-w-lg gap-6 bg-white p-8 md:p-12">
            <div className="photobox-stripe flex h-24 w-24 items-center justify-center rounded-2xl border-3 border-(--pb-ink) text-white shadow-[5px_5px_0_var(--pb-ink)]">
              <Camera className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-(--pb-pink)">Welcome to the studio</p>
                <h1 className="text-4xl font-black tracking-tight md:text-6xl">SnapBox <span className="text-[#6257d9]">AI</span></h1>
                <p className="text-sm font-medium text-gray-600">
                  Tunjukkan gestur <span className="font-black text-(--pb-coral)">Thumbs Up</span> untuk memotret otomatis.
              </p>
            </div>
            <div className="w-full">
              <p className="mb-2 text-left text-xs font-black uppercase tracking-wide">Jumlah potret</p>
              <div className="grid grid-cols-3 gap-2">
                {shotOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPhotoCount(option)}
                    className={`rounded-lg border-2 py-3 text-sm font-black transition-all ${
                      photoCount === option
                        ? 'border-(--pb-ink) bg-(--pb-lime) shadow-[3px_3px_0_var(--pb-ink)]'
                        : 'border-gray-300 bg-gray-50 hover:bg-(--pb-pink)'
                    }`}
                  >
                    {option}x
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleStartSession}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-(--pb-ink) bg-(--pb-coral) py-4 font-black uppercase tracking-wide shadow-[5px_5px_0_var(--pb-ink)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
                Mulai Kamera <Camera className="h-5 w-5" />
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
                captureNumber={captureNumber}
                maxPhotos={photoCount}
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
              stickers={stickers}
              onAddSticker={addSticker}
              onStickerChange={moveSticker}
              onStageReady={(ref) => (stageRef.current = ref)}
            />

            {/* Sidebar Panel Kontrol Filter & Unduh */}
            <div className="flex flex-col items-center gap-6">
              <FilterControls
                currentTheme={theme}
                currentFilter={filter}
                onThemeChange={setTheme}
                onFilterChange={setFilter}
                onAddSticker={addSticker}
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
      <footer className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-(--pb-ink)/60 text-center">
        Make a moment worth keeping
      </footer>
    </main>
  );
}