import React, { useState, useEffect } from 'react';

interface GlitchOverlayProps {
  children: React.ReactNode;
  /** Enable or disable glitching */
  active?: boolean;
  /** Minimum interval in ms between glitches */
  minInterval?: number;
  /** Maximum interval in ms between glitches */
  maxInterval?: number;
}

export const GlitchOverlay: React.FC<GlitchOverlayProps> = ({
  children,
  active = true,
  minInterval = 20,
  maxInterval = 100,
}) => {
  const [isGlitching, setIsGlitching] = useState<boolean>(false);

  useEffect(() => {
    if (!active) return;

    let timeoutId: NodeJS.Timeout;

    const triggerGlitch = () => {
      setIsGlitching(true);

      // Glitch duration burst (200ms - 400ms)
      const duration = 100 + Math.random() * 100;
      setTimeout(() => setIsGlitching(false), duration);

      // Schedule next burst
      const nextDelay = minInterval + Math.random() * (maxInterval - minInterval);
      timeoutId = setTimeout(triggerGlitch, nextDelay);
    };

    timeoutId = setTimeout(triggerGlitch, 2000);

    return () => clearTimeout(timeoutId);
  }, [active, minInterval, maxInterval]);

  return (
    <div className="relative w-screen min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* 1. SVG Chromatic Aberration Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="chromatic-glitch">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />
            <feOffset in="red" dx="2" dy="-2" result="red-offset" />

            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 1.2 0 0 0  0 0 1.5 0 0  0 0 0 1 0"
              result="cyan"
            />
            <feOffset in="cyan" dx="-16" dy="1" result="cyan-offset" />

            <feBlend mode="screen" in="red-offset" in2="cyan-offset" />
          </filter>
        </defs>
      </svg>

      {/* 2. Primary Screen Content */}
      <div
        className={`w-full min-h-screen transition-all ${
          isGlitching ? '[filter:url(#chromatic-glitch)]' : ''
        }`}
      >
        {children}
      </div>

      {/* 3. Full-Screen Horizontal Slice Layers */}
      {isGlitching && (
        <>
          {/* Top/Mid Slice */}
          <div
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-90 animate-glitch-slice-1"
            aria-hidden="true"
          >
            <div className="w-full h-full -translate-x-10">{children}</div>
          </div>

          {/* Mid/Bottom Slice */}
          <div
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen opacity-90 animate-glitch-slice-2"
            aria-hidden="true"
          >
            <div className="w-full h-full translate-x-10">{children}</div>
          </div>

          {/* Heavy Interference Flash Bar */}
          {/* <div
            className="fixed inset-0 pointer-events-none z-50 bg-cyan-500/10 mix-blend-overlay animate-glitch-bar"
            aria-hidden="true"
          /> */}
        </>
      )}
    </div>
  );
};

export default GlitchOverlay;