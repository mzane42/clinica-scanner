import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { QRScanner } from '@/components/scanner/QRScanner';
import { ScanResult, type ScanStatus } from '@/components/scanner/ScanResult';
import { ManualSearch } from '@/components/scanner/ManualSearch';
import { StatsHeader } from '@/components/dashboard/StatsHeader';
import { RecentScans } from '@/components/dashboard/RecentScans';
import { checkinByQR, checkinByEmail, getStats, type CheckinResponse, type RecentScan } from '@/lib/api';
import { LogOut, User } from 'lucide-react';

export function ScannerPage() {
  const { user, logout } = useAuth();

  // Stats state
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentDay, setCurrentDay] = useState('J1');
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Scan state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: ScanStatus;
    response?: CheckinResponse;
    errorMessage?: string;
  } | null>(null);

  // Fetch stats on mount and periodically
  const fetchStats = useCallback(async () => {
    try {
      const stats = await getStats();
      setTodayCount(stats.stats.todayCheckedIn);
      setTotalCount(stats.stats.totalCheckedIn);
      setCurrentDay(stats.currentDay);
      setRecentScans(stats.recentScans);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Handle QR scan
  const handleQRScan = useCallback(async (data: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Pass raw QR data directly to API - it handles JSON format
      const response = await checkinByQR(data);

      if (!response.valid && !response.alreadyToday) {
        setScanResult({ status: 'invalid', response });
      } else if (response.alreadyToday) {
        setScanResult({ status: 'duplicate', response });
      } else {
        setScanResult({ status: 'success', response });
        // Refresh stats after successful check-in
        fetchStats();
      }
    } catch (error) {
      setScanResult({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur de connexion',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, fetchStats]);

  // Handle email search
  const handleEmailSearch = useCallback(async (email: string) => {
    if (isSearching) return;

    setIsSearching(true);

    try {
      const response = await checkinByEmail(email);

      if (!response.valid) {
        setScanResult({ status: 'invalid', response });
      } else if (response.alreadyToday) {
        setScanResult({ status: 'duplicate', response });
      } else {
        setScanResult({ status: 'success', response });
        // Refresh stats after successful check-in
        fetchStats();
      }
    } catch (error) {
      setScanResult({
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erreur de connexion',
      });
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, fetchStats]);

  // Dismiss scan result
  const handleDismissResult = useCallback(() => {
    setScanResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Stats */}
      <StatsHeader
        todayCount={todayCount}
        totalCount={totalCount}
        currentDay={currentDay}
        isLoading={isLoadingStats}
        onRefresh={fetchStats}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {/* Scanner */}
        <div className="p-4">
          <QRScanner onScan={handleQRScan} isProcessing={isProcessing} />
        </div>

        {/* Manual Search */}
        <div className="px-4 pb-2">
          <ManualSearch onSearch={handleEmailSearch} isSearching={isSearching} />
        </div>

        {/* Recent Scans */}
        <RecentScans scans={recentScans} isLoading={isLoadingStats} />
      </main>

      {/* Footer with User Info */}
      <footer className="bg-card border-t border-border px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </footer>

      {/* Scan Result Overlay */}
      {scanResult && (
        <ScanResult
          status={scanResult.status}
          response={scanResult.response}
          errorMessage={scanResult.errorMessage}
          onDismiss={handleDismissResult}
        />
      )}
    </div>
  );
}
