import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { cn, vibrate } from '@/lib/utils';

interface QRScannerProps {
  onScan: (data: string) => void;
  isProcessing: boolean;
}

export function QRScanner({ onScan, isProcessing }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const startScanning = useCallback(async () => {
    try {
      setError(null);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader', {
          verbose: false,
          useBarCodeDetectorIfSupported: true,
        });
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Debounce: prevent scanning the same code within 3 seconds
          const now = Date.now();
          if (
            decodedText === lastScanRef.current &&
            now - lastScanTimeRef.current < 3000
          ) {
            return;
          }

          lastScanRef.current = decodedText;
          lastScanTimeRef.current = now;

          vibrate([100, 50, 100]);
          onScan(decodedText);
        },
        () => {
          // Ignore scan failures (no QR in view)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError(
        'Impossible d\'accéder à la caméra. Vérifiez les permissions dans les paramètres.'
      );
    }
  }, [onScan]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Pause scanner when processing
  useEffect(() => {
    if (isProcessing && scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.pause();
    } else if (!isProcessing && scannerRef.current && isScanning) {
      try {
        scannerRef.current.resume();
      } catch {
        // Scanner might not be paused
      }
    }
  }, [isProcessing, isScanning]);

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-square max-w-md mx-auto">
        <div id="qr-reader" className="w-full h-full" />

        {/* Placeholder when camera is off */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
            <Camera className="w-20 h-20 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-sm">Caméra inactive</p>
          </div>
        )}

        {/* Scanning indicator */}
        {isScanning && !isProcessing && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-lg" />

            {/* Scanning line animation */}
            <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <RefreshCw className="w-12 h-12 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className={cn(
              'btn-primary flex items-center gap-3 text-lg px-8 py-4',
              'touch-target'
            )}
          >
            <Camera className="w-6 h-6" />
            Démarrer le scan
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className={cn(
              'btn-danger flex items-center gap-3 text-lg px-8 py-4',
              'touch-target'
            )}
          >
            <CameraOff className="w-6 h-6" />
            Arrêter
          </button>
        )}
      </div>
    </div>
  );
}
