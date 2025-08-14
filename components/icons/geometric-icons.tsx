import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// First icon: Blue top diamond, orange bottom chevron
export const ChatIcon: React.FC<IconProps> = ({ className = "", size = 40 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(20, 20)">
      {/* Top blue diamond */}
      <path 
        d="M0 -15 L8 -7 L0 1 L-8 -7 Z" 
        fill="#00BFFF"
      />
      {/* Bottom orange chevron */}
      <path 
        d="M-8 3 L0 11 L8 3 L0 15 Z" 
        fill="#FF6B35"
      />
    </g>
  </svg>
);

// Second icon: Purple diamond with orange square overlay
export const ProfileIcon: React.FC<IconProps> = ({ className = "", size = 40 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(20, 20)">
      {/* Purple diamond */}
      <path 
        d="M0 -12 L12 0 L0 12 L-12 0 Z" 
        fill="#B19CD9"
      />
      {/* Orange square overlay */}
      <rect 
        x="-4" 
        y="-4" 
        width="8" 
        height="8" 
        fill="#FF6B35"
      />
    </g>
  </svg>
);

// Third icon: Blue squares with purple diamond
export const InsightsIcon: React.FC<IconProps> = ({ className = "", size = 40 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(20, 20)">
      {/* Large blue square */}
      <rect 
        x="-10" 
        y="-10" 
        width="12" 
        height="12" 
        fill="#00BFFF"
      />
      {/* Small blue square */}
      <rect 
        x="4" 
        y="4" 
        width="6" 
        height="6" 
        fill="#00BFFF"
      />
      {/* Purple diamond */}
      <path 
        d="M6 -4 L10 0 L6 4 L2 0 Z" 
        fill="#B19CD9"
      />
    </g>
  </svg>
);

// Fourth icon: Orange square with green chevron
export const SaveIcon: React.FC<IconProps> = ({ className = "", size = 40 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(20, 20)">
      {/* Orange square */}
      <rect 
        x="-8" 
        y="-12" 
        width="10" 
        height="10" 
        fill="#FF6B35"
      />
      {/* Green chevron/arrow */}
      <path 
        d="M4 -4 L12 4 L4 12 L8 8 L12 4 L8 0 Z" 
        fill="#10B981"
      />
    </g>
  </svg>
);

export default {
  ChatIcon,
  ProfileIcon,
  InsightsIcon,
  SaveIcon,
};