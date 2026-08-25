'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  count: number | null;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  if (count === null || count <= 0) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <span className="text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
            {count}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}