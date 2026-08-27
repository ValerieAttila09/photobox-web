export type AppStage = 'START' | 'SCANNING' | 'COUNTDOWN' | 'CAPTURING' | 'RESULT';

export type PhotoFilter = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'warm' | 'cool';

export type FrameTheme = 'classic-white' | 'dark-mode' | 'pastel-pink' | 'retro-yellow' | 'cyber-blue';

export type PhotoCount = 2 | 3 | 4;

export interface PhotoboxSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface GestureDetectionResult {
  gestureName: string;
  score: number;
}