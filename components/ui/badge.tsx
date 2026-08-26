import React from 'react';
import { getStatusBadgeClass, formatStatusLabel } from '@/lib/utils/formatters';

interface BadgeProps {
  status: string;
  className?: string;
  dot?: boolean;
}

export function Badge({ status, className = '', dot = true }: BadgeProps) {
  const badgeClass = getStatusBadgeClass(status);
  const label = formatStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClass} ${className}`}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
