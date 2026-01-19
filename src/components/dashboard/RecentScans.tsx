import { CheckCircle, Users } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { RecentScan } from '@/lib/api';

interface RecentScansProps {
  scans: RecentScan[];
  isLoading?: boolean;
}

export function RecentScans({ scans, isLoading }: RecentScansProps) {
  if (isLoading && scans.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Scans récents</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Scans récents</h2>
        {scans.length > 0 && (
          <span className="text-sm text-muted-foreground">({scans.length})</span>
        )}
      </div>

      {scans.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun scan pour le moment</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
          {scans.map((scan, index) => (
            <div
              key={`${scan.email || scan.name}-${index}`}
              className="bg-card rounded-xl p-4 flex items-center justify-between border border-border animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">
                  {scan.name}
                </p>
                {scan.company && (
                  <p className="text-sm text-muted-foreground truncate">
                    {scan.company}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-primary text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Validé
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(scan.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
