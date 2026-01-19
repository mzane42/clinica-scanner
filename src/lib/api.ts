const CHECKIN_URL = import.meta.env.VITE_CHECKIN_WEBHOOK_URL;
const STATS_URL = import.meta.env.VITE_STATS_WEBHOOK_URL;

export interface Visitor {
  name: string;
  company: string;
  email: string;
}

export interface ScanInfo {
  day: string;
  timestamp?: string;
  previousScanTime?: string;
  status: string;
}

export interface CheckinResponse {
  valid: boolean;
  alreadyToday?: boolean;
  message: string;
  visitor?: Visitor;
  scanInfo?: ScanInfo;
}

export interface RecentScan {
  name: string;
  company: string;
  timestamp: string;
  day: string;
  email?: string;
}

export interface StatsResponse {
  currentDay: string;
  stats: {
    totalRegistered: number;
    totalCheckedIn: number;
    todayCheckedIn: number;
    byDay: {
      J1: number;
      J2: number;
      J3: number;
    };
  };
  recentScans: RecentScan[];
  generatedAt: string;
}

export async function checkinByQR(id: string): Promise<CheckinResponse> {
  if (!CHECKIN_URL) {
    throw new Error('Webhook URL not configured');
  }

  const response = await fetch(CHECKIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  const data = await response.json();

  if (!response.ok && response.status !== 404) {
    throw new Error(data.message || 'Erreur de connexion');
  }

  return data;
}

export async function checkinByEmail(email: string): Promise<CheckinResponse> {
  if (!CHECKIN_URL) {
    throw new Error('Webhook URL not configured');
  }

  const response = await fetch(CHECKIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok && response.status !== 404) {
    throw new Error(data.message || 'Erreur de connexion');
  }

  return data;
}

export async function getStats(): Promise<StatsResponse> {
  if (!STATS_URL) {
    throw new Error('Stats URL not configured');
  }

  const response = await fetch(STATS_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des statistiques');
  }

  return response.json();
}
