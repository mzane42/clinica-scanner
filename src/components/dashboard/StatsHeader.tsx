import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsHeaderProps {
  todayCount: number;
  totalCount: number;
  currentDay: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function StatsHeader({
  todayCount,
  totalCount,
  currentDay,
  isLoading,
  onRefresh,
}: StatsHeaderProps) {
  return (
    <header className="gradient-header px-4 py-4 safe-area-top">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/icon-192.png" 
            alt="Clinica Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-white font-display">CLINICA  EXPO 2026</h1>
            <p className="text-emerald-100 text-sm flex items-center gap-2">
              Scanner de badges
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">
                {currentDay}
              </span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Actualiser"
            >
              <RefreshCw
                className={cn('w-5 h-5', isLoading && 'animate-spin')}
              />
            </button>
          )}

          {/* Today's Count */}
          <div className="stat-card text-center min-w-[70px]">
            <div className="text-2xl font-bold text-white">{todayCount}</div>
            <div className="text-xs text-emerald-100">Aujourd'hui</div>
          </div>

          {/* Total Count */}
          <div className="stat-card text-center min-w-[70px]">
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-xs text-emerald-100">Total</div>
          </div>
        </div>
      </div>
    </header>
  );
}
