import { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { cn, vibrate } from '@/lib/utils';

interface QRScannerProps {
  onScan: (data: string) => void;
  isProcessing: boolean;
}

export function QRScanner({ onScan, isProcessing }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const handleScan = useCallback(
    (result: QrScanner.ScanResult) => {
      const decodedText = result.data;

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
    [onScan]
  );

  const startScanning = useCallback(async () => {
    if (!videoRef.current) {
      setDebugInfo('No video element');
      return;
    }

    try {
      setError(null);
      setDebugInfo('Checking camera...');

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      setDebugInfo(`Has camera: ${hasCamera}`);

      if (!hasCamera) {
        setError('Aucune caméra détectée sur cet appareil.');
        return;
      }

      // List available cameras for debugging
      const cameras = await QrScanner.listCameras(true);
      setDebugInfo(`Found ${cameras.length} cameras: ${cameras.map(c => c.label).join(', ')}`);

      // Destroy previous scanner if exists
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }

      setDebugInfo('Creating scanner...');

      scannerRef.current = new QrScanner(
        videoRef.current,
        handleScan,
        {
          preferredCamera: 'environment',
          highlightScanRegion: false,
          highlightCodeOutline: false,
          maxScansPerSecond: 10,
        }
      );

      setDebugInfo('Starting scanner...');
      await scannerRef.current.start();

      // Override qr-scanner's inline styles that hide the video
      if (videoRef.current) {
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = '100%';
        videoRef.current.style.opacity = '1';
        videoRef.current.style.transform = 'none';
        videoRef.current.style.position = 'absolute';
        videoRef.current.style.top = '0';
        videoRef.current.style.left = '0';
      }

      setDebugInfo('');
      setIsScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setError(
        "Impossible d'accéder à la caméra. Vérifiez les permissions dans les paramètres."
      );
    }
  }, [handleScan]);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setDebugInfo('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  // Pause scanner when processing
  useEffect(() => {
    if (!scannerRef.current || !isScanning) return;

    if (isProcessing) {
      scannerRef.current.pause();
    } else {
      scannerRef.current.start().catch(() => {
        // Scanner might already be running
      });
    }
  }, [isProcessing, isScanning]);

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-square max-w-md mx-auto">
        {/* Video element - always in DOM */}
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isScanning ? 'block' : 'none',
          }}
        />

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

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-400 font-mono">{debugInfo}</p>
        </div>
      )}

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
