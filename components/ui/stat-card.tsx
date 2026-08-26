import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'navy' | 'gold' | 'emerald' | 'amber';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'navy':
        return 'bg-[#082B52] text-white border-[#061E39] shadow-md';
      case 'gold':
        return 'bg-amber-500 text-slate-950 border-amber-600 shadow-md';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-950 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-950 border-amber-200';
      default:
        return 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs';
    }
  };

  const getIconContainerStyles = () => {
    switch (variant) {
      case 'navy':
        return 'bg-white/10 text-amber-400';
      case 'gold':
        return 'bg-black/10 text-slate-950';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-700';
      case 'amber':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-[#082B52]';
    }
  };

  const getSubtitleStyles = () => {
    switch (variant) {
      case 'navy':
        return 'text-slate-300';
      case 'gold':
        return 'text-slate-800';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 border transition-all ${getVariantStyles()} ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${getSubtitleStyles()}`}>
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${getIconContainerStyles()}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between text-xs">
          {subtitle && <span className={getSubtitleStyles()}>{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
