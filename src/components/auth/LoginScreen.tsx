import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  initializeGoogleAuth,
  renderGoogleButton,
  type GoogleCredentialResponse,
} from '@/lib/google-auth';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function LoginScreen() {
  const { login, error, clearError } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const handleCredentialResponse = (response: GoogleCredentialResponse) => {
      login(response.credential);
    };

    // Wait for Google script to load
    const initGoogle = () => {
      if (window.google && buttonRef.current) {
        initializeGoogleAuth(handleCredentialResponse);
        renderGoogleButton(buttonRef.current);
        initialized.current = true;
      } else {
        // Retry if not loaded yet
        setTimeout(initGoogle, 100);
      }
    };

    initGoogle();
  }, [login]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-header px-6 py-8 safe-area-top">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-display">CLINICA 2026</h1>
            <p className="text-emerald-100 text-sm">Scanner de badges</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo / Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-card rounded-3xl mx-auto mb-6 flex items-center justify-center border border-border">
              <svg
                className="w-14 h-14 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Connexion requise
            </h2>
            <p className="text-muted-foreground text-sm">
              Connectez-vous avec votre compte Google autorisé pour accéder au scanner.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-destructive font-medium">{error}</p>
                <button
                  onClick={clearError}
                  className="text-xs text-destructive/70 hover:text-destructive mt-1 underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="flex justify-center">
            <div ref={buttonRef} className="h-12" />
          </div>

          {/* Info */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Seuls les comptes autorisés peuvent accéder au scanner.
            <br />
            Contactez l'équipe Evensium si vous n'avez pas accès.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center safe-area-bottom">
        <p className="text-xs text-muted-foreground">
          evensium &middot; CLINICA EXPO 2026
        </p>
      </footer>
    </div>
  );
}
