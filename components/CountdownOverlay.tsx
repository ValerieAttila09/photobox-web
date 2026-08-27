'use client';

interface CountdownOverlayProps {
  count: number | null;
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  if (count === null || count <= 0) return null;

  return (
    <div className="countdown-overlay absolute inset-0 z-20 flex items-center justify-center bg-black/35">
      <div key={count} className="countdown-number flex items-center justify-center">
        <span className="text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
          {count}
        </span>
      </div>
    </div>
  );
}