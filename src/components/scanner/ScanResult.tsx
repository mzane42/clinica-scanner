import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn, vibrate } from '@/lib/utils';
import type { CheckinResponse } from '@/lib/api';

export type ScanStatus = 'success' | 'duplicate' | 'invalid' | 'error';

interface ScanResultProps {
  status: ScanStatus;
  response?: CheckinResponse;
  errorMessage?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function ScanResult({
  status,
  response,
  errorMessage,
  onDismiss,
  autoDismissMs = 4000,
}: ScanResultProps) {
  // Vibrate feedback based on status
  useEffect(() => {
    switch (status) {
      case 'success':
        vibrate([100, 50, 100, 50, 200]);
        break;
      case 'duplicate':
        vibrate([200, 100, 200]);
        break;
      case 'invalid':
      case 'error':
        vibrate([500]);
        break;
    }
  }, [status]);

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  const config = {
    success: {
      bg: 'bg-emerald-500',
      icon: CheckCircle,
      animation: 'animate-pulse-success',
      title: response?.message || 'Check-in réussi',
    },
    duplicate: {
      bg: 'bg-amber-500',
      icon: Clock,
      animation: 'animate-pulse-warning',
      title: response?.message || 'Déjà scanné aujourd\'hui',
    },
    invalid: {
      bg: 'bg-rose-500',
      icon: XCircle,
      animation: 'animate-pulse-error',
      title: response?.message || 'Badge non reconnu',
    },
    error: {
      bg: 'bg-rose-500',
      icon: AlertTriangle,
      animation: 'animate-pulse-error',
      title: errorMessage || 'Erreur de connexion',
    },
  };

  const { bg, icon: Icon, animation, title } = config[status];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-6',
        bg,
        animation
      )}
      onClick={onDismiss}
    >
      <div className="text-center text-white animate-fade-in">
        {/* Icon */}
        <div className="mb-6">
          <Icon className="w-24 h-24 mx-auto" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">{title}</h2>

        {/* Visitor Info */}
        {response?.visitor && (
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-sm mx-auto">
            <p className="text-3xl font-bold mb-1">{response.visitor.name}</p>
            {response.visitor.company && (
              <p className="text-white/80 text-lg">{response.visitor.company}</p>
            )}
          </div>
        )}

        {/* Scan Info for duplicate */}
        {status === 'duplicate' && response?.scanInfo?.previousScanTime && (
          <p className="mt-4 text-white/80">
            Scanné à {response.scanInfo.previousScanTime}
          </p>
        )}

        {/* Day Badge */}
        {response?.scanInfo?.day && (
          <div className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-full">
            <span className="font-semibold">{response.scanInfo.day}</span>
            {response.scanInfo.status && (
              <span className="ml-2 text-white/80">• {response.scanInfo.status}</span>
            )}
          </div>
        )}

        {/* Tap to dismiss hint */}
        <p className="mt-8 text-white/60 text-sm">
          Appuyez pour continuer
        </p>
      </div>
    </div>
  );
}
