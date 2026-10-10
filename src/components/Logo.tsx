import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const textSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl md:text-4xl',
    lg: 'text-4xl sm:text-5xl',
    hero: 'text-5xl sm:text-7xl',
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className={`font-extrabold tracking-tight leading-none ${textSizes[size]} flex items-center`}>
        <span className="text-[#105C2B]">শেখা</span>
        <span className="text-[#FACC15]">ঘর</span>
      </div>
      {showTagline && (
        <div className="flex items-center gap-2 mt-1 sm:mt-2">
          <span className="hidden sm:block w-4 h-0.5 bg-[#FACC15]"></span>
          <span className="text-[10px] sm:text-xs md:text-sm font-medium text-[#105C2B] whitespace-nowrap">
            শিখুন নিজের গতিতে, এগিয়ে যান আত্মবিশ্বাসে।
          </span>
          <span className="hidden sm:block w-4 h-0.5 bg-[#FACC15]"></span>
        </div>
      )}
    </div>
  );
};

