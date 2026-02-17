
import React, { useState, useRef } from 'react';

interface Props {
  before: string;
  after: string;
}

const BeforeAfterSlider: React.FC<Props> = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-[40px] overflow-hidden cursor-ew-resize select-none shadow-2xl bg-neutral-100"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Always visible in background) */}
      <img 
        src={after} 
        className="absolute inset-0 w-full h-full object-cover" 
        alt="Redesigned" 
        loading="eager"
      />
      
      {/* Before Image (Clipped overlay) */}
      <img 
        src={before} 
        className="absolute inset-0 w-full h-full object-cover" 
        style={{ 
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
        }} 
        alt="Original" 
        loading="eager"
      />

      {/* Slider Bar */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center z-10 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl -translate-x-1/2 border-4 border-[#061a10]/5">
          <svg className="w-6 h-6 text-[#061a10]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-8 left-8 bg-black/50 backdrop-blur-xl text-white text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] pointer-events-none z-20">
        Before
      </div>
      <div className="absolute top-8 right-8 bg-[#32CD32] text-[#061a10] text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] pointer-events-none z-20 shadow-lg">
        BloomUp After
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
