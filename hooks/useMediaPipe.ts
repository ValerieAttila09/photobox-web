import { useEffect, useRef, useState, useCallback } from 'react';
import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

interface UseMediaPipeProps {
  active: boolean;
  onGestureDetected: (gestureName: string) => void;
  minConfidence?: number;
}

export function useMediaPipe({
  active,
  onGestureDetected,
  minConfidence = 0.75,
}: UseMediaPipeProps) {
  const [isReady, setIsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const cameraStartingRef = useRef(false);
  const predictWebcamRef = useRef<() => void>(() => {});

  // 1. Inisialisasi MediaPipe Gesture Recognizer
  useEffect(() => {
    let isMounted = true;

    async function initMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/gesture_recognizer.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        if (isMounted) {
          recognizerRef.current = recognizer;
          setIsReady(true);
        }
      } catch (err) {
        console.error('Gagal menginisialisasi MediaPipe:', err);
        if (isMounted) {
          setError('Gagal memuat model deteksi gestur.');
        }
      }
    }

    initMediaPipe();

    return () => {
      isMounted = false;
      if (recognizerRef.current) {
        recognizerRef.current.close();
      }
    };
  }, []);

  // 2. Membuka Akses Kamera (Webcam)
  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    if (!video || cameraStartingRef.current || video.srcObject) return;

    cameraStartingRef.current = true;
    let stream: MediaStream | undefined;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported');
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      video.srcObject = stream;
      await video.play();
      setCameraActive(true);
      setError(null);
    } catch (err) {
      console.error('Akses kamera ditolak atau gagal:', err);
      stream?.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
      setError('Kamera tidak dapat dibuka. Izinkan akses kamera dan gunakan HTTPS atau localhost.');
    } finally {
      cameraStartingRef.current = false;
    }
  }, []);

  // 3. Menghentikan Kamera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      const startTimer = window.setTimeout(() => void startCamera(), 0);
      return () => window.clearTimeout(startTimer);
    } else {
      stopCamera();
    }
  }, [active, startCamera, stopCamera]);

  // 4. Deteksi Gestur Loop Real-time
  const predictWebcam = useCallback(() => {
    const video = videoRef.current;
    const recognizer = recognizerRef.current;

    if (
      active &&
      recognizer &&
      video &&
      video.readyState >= 2 &&
      !video.paused
    ) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const startTimeMs = performance.now();
        const results = recognizer.recognizeForVideo(video, startTimeMs);

        if (results.gestures && results.gestures.length > 0) {
          const topGesture = results.gestures[0][0];
          if (
            topGesture.categoryName === 'Thumb_Up' &&
            topGesture.score >= minConfidence
          ) {
            onGestureDetected('Thumb_Up');
          }
        }
      }
    }

    if (active) {
      requestRef.current = requestAnimationFrame(() => predictWebcamRef.current());
    }
  }, [active, minConfidence, onGestureDetected]);

  useEffect(() => {
    predictWebcamRef.current = predictWebcam;
  }, [predictWebcam]);

  // Loop RAF Trigger
  useEffect(() => {
    if (active && cameraActive && isReady) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active, cameraActive, isReady, predictWebcam]);

  return {
    videoRef,
    isReady,
    cameraActive,
    error,
    startCamera,
    stopCamera,
  };
}