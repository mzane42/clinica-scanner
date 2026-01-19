declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleAuthConfig) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleAuthConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
  locale?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface DecodedToken {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  sub: string;
  iat: number;
  exp: number;
}

export function decodeJwt(token: string): DecodedToken {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

export function initializeGoogleAuth(
  callback: (response: GoogleCredentialResponse) => void
): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Google Client ID not configured');
    return;
  }

  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

export function renderGoogleButton(element: HTMLElement): void {
  if (!window.google) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.renderButton(element, {
    theme: 'filled_blue',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    width: 280,
    locale: 'fr',
  });
}

export function isEmailAllowed(email: string): boolean {
  const allowedEmails = import.meta.env.VITE_ALLOWED_EMAILS || '';
  const emailList = allowedEmails.split(',').map((e: string) => e.trim().toLowerCase());
  return emailList.includes(email.toLowerCase());
}
