const CHECKIN_URL = import.meta.env.VITE_CHECKIN_WEBHOOK_URL;
const STATS_URL = import.meta.env.VITE_STATS_WEBHOOK_URL;

// ============================================================================
// Types for existing UI (unchanged)
// ============================================================================

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

// ============================================================================
// Types for new n8n workflow responses
// ============================================================================

interface N8nCheckinResponse {
  success: boolean;
  message: string;
  error_code?: 'ALREADY_CHECKED_IN' | 'INVALID_TICKET';
  data?: {
    ticket_id: string;
    name: string;
    ticket_number: string;
    email: string;
    checked_in_at: string;
  };
}

// ============================================================================
// Adapter: Convert n8n response to existing UI format
// ============================================================================

function adaptN8nResponse(response: N8nCheckinResponse): CheckinResponse {
  console.log('n8n response:', response); // Debug logging
  
  // Check success field explicitly
  if (response.success === true && response.data) {
    return {
      valid: true,
      alreadyToday: false,
      message: response.message,
      visitor: {
        name: response.data.name || '',
        company: '', // Company info not returned by scan endpoint
        email: response.data.email || '',
      },
      scanInfo: {
        day: '',
        timestamp: response.data.checked_in_at,
        status: 'Validé'
      }
    };
  }

  // Handle error responses (success is false or undefined)
  const errorCode = response.error_code;
  const isAlreadyCheckedIn = errorCode === 'ALREADY_CHECKED_IN';

  if (isAlreadyCheckedIn) {
    return {
      valid: true, // Ticket exists but already scanned
      alreadyToday: true,
      message: response.message,
      visitor: undefined,
      scanInfo: {
        day: '',
        previousScanTime: extractTimeFromMessage(response.message),
        status: 'Déjà scanné'
      }
    };
  }

  // Invalid ticket or other error
  return {
    valid: false,
    alreadyToday: false,
    message: response.message || 'Ticket non valide',
    visitor: undefined,
    scanInfo: undefined
  };
}

/**
 * Extract timestamp from error message like "Ticket déjà scanné le 20/01/2026 14:30:00"
 */
function extractTimeFromMessage(message: string): string | undefined {
  const regex = /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/;
  const match = regex.exec(message);
  return match?.[1];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Check in a visitor by scanning their QR code
 * New format: sends { barcode: JSON string, scannedAt: ISO date }
 */
export async function checkinByQR(qrData: string): Promise<CheckinResponse> {
  if (!CHECKIN_URL) {
    throw new Error('Webhook URL not configured');
  }

  const response = await fetch(CHECKIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      barcode: qrData,
      scannedAt: new Date().toISOString()
    }),
  });

  const data: N8nCheckinResponse = await response.json();

  // Handle parse errors returned directly from workflow
  if (!response.ok && response.status !== 404) {
    if (data.message) {
      return {
        valid: false,
        message: data.message,
      };
    }
    throw new Error('Erreur de connexion');
  }

  return adaptN8nResponse(data);
}

/**
 * Check in a visitor by email search (manual lookup)
 * New format: sends { email: string, scannedAt: ISO date }
 */
export async function checkinByEmail(email: string): Promise<CheckinResponse> {
  if (!CHECKIN_URL) {
    throw new Error('Webhook URL not configured');
  }

  const response = await fetch(CHECKIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.toLowerCase(),
      scannedAt: new Date().toISOString()
    }),
  });

  const data: N8nCheckinResponse = await response.json();

  if (!response.ok && response.status !== 404) {
    if (data.message) {
      return {
        valid: false,
        message: data.message,
      };
    }
    throw new Error('Erreur de connexion');
  }

  return adaptN8nResponse(data);
}

/**
 * Fetch dashboard statistics
 */
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
