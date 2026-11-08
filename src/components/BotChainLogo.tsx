import React from 'react';

interface BotChainLogoProps {
  className?: string;
  size?: number;
}

export const BotChainLogo: React.FC<BotChainLogoProps> = ({
  className = 'w-6 h-6',
  size = 24,
}) => {
  return (
    <img
      src="/botchain-logo.png"
      alt="BOT Chain Logo"
      width={size}
      height={size}
      className={`inline-block object-contain rounded-md ${className}`}
      onError={(e) => {
        // Fallback to stylized SVG if image fails to load
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  );
};

