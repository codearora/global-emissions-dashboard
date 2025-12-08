import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  trend?: number; // percentage change
  trendLabel?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  isIncreaseGood?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  unit, 
  trend, 
  trendLabel, 
  icon, 
  colorClass = "bg-white",
  isIncreaseGood = false 
}) => {
  const isTrendUp = trend !== undefined && trend > 0;
  // Default (isIncreaseGood=false): Increase(Up) is Bad(Red), Decrease(Down) is Good(Green)
  // If isIncreaseGood=true: Increase(Up) is Good(Green), Decrease(Down) is Bad(Red)
  const isGood = isIncreaseGood ? isTrendUp : !isTrendUp;
  
  return (
    <div className={`${colorClass} rounded-xl p-6 shadow-sm border border-slate-200 hover:border-slate-300 transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
          <div className="flex items-baseline mt-2 gap-1">
            <span className="text-3xl font-bold text-slate-900">{value}</span>
            <span className="text-slate-500 text-sm font-semibold">{unit}</span>
          </div>
        </div>
        {icon && (
          <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
            {icon}
          </div>
        )}
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center text-sm">
          <span className={`font-medium ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isTrendUp ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500 ml-2">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;