import React from 'react';

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppCard({ children, className = '' }: AppCardProps) {
  return (
    <div className={`bg-white rounded-[22px] border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
