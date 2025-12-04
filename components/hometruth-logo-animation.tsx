"use client";

import Image from "next/image";

interface HomeTruthLogoAnimationProps {
  size?: number;
  className?: string;
}

export default function HomeTruthLogoAnimation({
  size = 24,
  className = "",
}: HomeTruthLogoAnimationProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 animate-pulse">
        <Image
          src="/images/hometruth-icon.svg"
          alt="HomeTruth"
          width={size}
          height={size}
          className="opacity-75"
        />
      </div>
      <div className="absolute inset-0 animate-ping">
        <Image
          src="/images/hometruth-icon.svg"
          alt="HomeTruth"
          width={size}
          height={size}
          className="opacity-30"
        />
      </div>
      <div className="absolute inset-0">
        <Image
          src="/images/hometruth-icon.svg"
          alt="HomeTruth"
          width={size}
          height={size}
          className="drop-shadow-sm"
        />
      </div>
    </div>
  );
}

