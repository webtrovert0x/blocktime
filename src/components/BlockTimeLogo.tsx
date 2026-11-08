import React from 'react';

interface BlockTimeLogoProps {
  className?: string;
  size?: number;
}

export const BlockTimeLogo: React.FC<BlockTimeLogoProps> = ({
  className = 'w-9 h-9',
  size,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size || undefined}
      height={size || undefined}
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="btCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="btCubeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="btCubeRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="btClockDial" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
      </defs>

      {/* Isometric Block Cube */}
      <g>
        <polygon points="100,22 168,61 100,100 32,61" fill="url(#btCubeTop)" />
        <polygon points="32,61 100,100 100,178 32,139" fill="url(#btCubeLeft)" />
        <polygon points="100,100 168,61 168,139 100,178" fill="url(#btCubeRight)" />

        <line x1="100" y1="36" x2="100" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <line x1="70" y1="52" x2="80" y2="58" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <line x1="130" y1="52" x2="120" y2="58" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* Chronometer Centered on Front */}
      <g transform="translate(100, 118)">
        <circle r="44" fill="url(#btClockDial)" stroke="#2563eb" strokeWidth="4.5" />
        <circle r="38" fill="#ffffff" stroke="#dbeafe" strokeWidth="1.5" />

        {/* Hour Ticks */}
        <line x1="0" y1="-32" x2="0" y2="-25" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="32" x2="0" y2="25" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="-32" y1="0" x2="-25" y2="0" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="0" x2="25" y2="0" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />

        {/* Diagonal Minute Ticks */}
        <line x1="-22" y1="-22" x2="-18" y2="-18" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="-22" x2="18" y2="-18" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
        <line x1="-22" y1="22" x2="-18" y2="18" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="22" x2="18" y2="18" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />

        {/* Clock Hands */}
        <line x1="0" y1="0" x2="-15" y2="-13" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1="0" x2="19" y2="-17" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="5" x2="0" y2="-26" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

        <circle r="4" fill="#1e3a8a" />
        <circle r="1.5" fill="#ffffff" />
      </g>
    </svg>
  );
};

