import React from 'react';

/**
 * Syncora Brand Asset (image_7.png)
 * Tri-petal emblem: Royal Blue, Violet Purple, and Turquoise Mint petals
 * over deep dark slate-900 contrast background container.
 */
export default function SyncoraLogo({
  className = 'w-9 h-9',
  withBackground = true,
  variant = 'icon', // 'icon' | 'full'
}) {
  const iconSvg = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full transform transition-transform group-hover:scale-105"
      aria-hidden="true"
    >
      <g transform="translate(50, 50)">
        {/* Left Petal: Royal Blue */}
        <path
          d="M 0 0 C -12 -7, -17 -21, -6 -34 C -2 -38, 2 -38, 6 -34 C 17 -21, 12 -7, 0 0 Z"
          fill="#4F55F8"
          transform="rotate(-78)"
        />
        {/* Top-Right Petal: Violet / Purple */}
        <path
          d="M 0 0 C -12 -7, -17 -21, -6 -34 C -2 -38, 2 -38, 6 -34 C 17 -21, 12 -7, 0 0 Z"
          fill="#7865FA"
          transform="rotate(42)"
        />
        {/* Bottom Petal: Turquoise / Mint */}
        <path
          d="M 0 0 C -12 -7, -17 -21, -6 -34 C -2 -38, 2 -38, 6 -34 C 17 -21, 12 -7, 0 0 Z"
          fill="#20D6B5"
          transform="rotate(162)"
        />
      </g>
    </svg>
  );

  if (!withBackground) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{iconSvg}</div>;
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-md shadow-slate-950/30 overflow-hidden flex-shrink-0 ${className}`}
    >
      <div className="w-[84%] h-[84%] flex items-center justify-center">
        {iconSvg}
      </div>
    </div>
  );
}

