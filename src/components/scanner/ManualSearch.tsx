import { useState } from 'react';
import { Search, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualSearchProps {
  onSearch: (email: string) => void;
  isSearching: boolean;
}

export function ManualSearch({ onSearch, isSearching }: ManualSearchProps) {
  const [email, setEmail] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !isSearching) {
      onSearch(email.trim());
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Recherche manuelle par email</span>
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Recherche par email
        </span>
        <button
          onClick={() => {
            setIsExpanded(false);
            setEmail('');
          }}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
        >
          Fermer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="visiteur@email.com"
          className={cn(
            'input-field flex-1 py-2.5 text-sm',
            isSearching && 'opacity-50'
          )}
          disabled={isSearching}
          autoFocus
          autoComplete="email"
          inputMode="email"
        />
        <button
          type="submit"
          disabled={!email.trim() || isSearching}
          className={cn(
            'btn-primary px-4 py-2.5 flex items-center gap-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </form>

      <p className="text-xs text-muted-foreground mt-2">
        Utilisez cette option si le QR code est illisible
      </p>
    </div>
  );
}
