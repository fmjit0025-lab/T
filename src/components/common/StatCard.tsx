import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'purple';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  badge,
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Status</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            badge.variant === 'danger' ? 'bg-rose-100 text-rose-700' :
            badge.variant === 'warning' ? 'bg-amber-100 text-amber-700' :
            badge.variant === 'success' ? 'bg-emerald-100 text-emerald-700' :
            badge.variant === 'purple' ? 'bg-purple-100 text-purple-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
