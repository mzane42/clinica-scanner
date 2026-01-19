# CLINICA 2026 - Scanner de badges

Application mobile-first pour le check-in des visiteurs lors de CLINICA EXPO 2026.

## Fonctionnalites

- **Scan QR Code** : Scan rapide des badges visiteurs
- **Recherche manuelle** : Fallback par email si le QR est illisible
- **Multi-jour** : Tracking des presences J1, J2, J3
- **Temps reel** : Statistiques et scans recents en temps reel
- **PWA** : Installable sur mobile, fonctionne hors-ligne (splash)
- **Securise** : Authentification Google OAuth avec whitelist

## Configuration

### 1. Google Cloud Console

1. Creer un projet dans [Google Cloud Console](https://console.cloud.google.com/)
2. Activer l'API Google Identity
3. Creer des identifiants OAuth 2.0 (Application Web)
4. Ajouter les origines autorisees :
   - `http://localhost:5174` (dev)
   - `https://scanner.evensium.com` (prod)

### 2. Variables d'environnement

Copier `.env.example` vers `.env` et configurer :

```env
VITE_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
VITE_ALLOWED_EMAILS=Ops@evensium.com,anismzane@gmail.com
VITE_CHECKIN_WEBHOOK_URL=https://votre-n8n/webhook/clinica-checkin
VITE_STATS_WEBHOOK_URL=https://votre-n8n/webhook/clinica-checkin-stats
```

### 3. n8n Workflows

Importer les workflows depuis `/docs/` :
- `n8n-checkin-workflow.json` - POST /clinica-checkin
- `n8n-checkin-stats-workflow.json` - GET /clinica-checkin-stats

Configurer les credentials Google Sheets dans n8n.

### 4. Google Sheets

Ajouter les colonnes suivantes a la feuille "Inscriptions" :
- `Scan J1` (timestamp du scan J1)
- `Scan J2` (timestamp du scan J2)
- `Scan J3` (timestamp du scan J3)

## Developpement

```bash
# Installation
bun install

# Demarrage
bun run dev

# Build
bun run build
```

## Deploiement

Deployer sur Vercel ou Netlify avec les variables d'environnement configurees.

## Architecture

```
clinica-scanner/
├── src/
│   ├── components/
│   │   ├── auth/           # Login, ProtectedRoute
│   │   ├── scanner/        # QRScanner, ScanResult, ManualSearch
│   │   └── dashboard/      # StatsHeader, RecentScans
│   ├── contexts/           # AuthContext
│   ├── hooks/              # Custom hooks
│   ├── lib/                # API, utils, google-auth
│   └── pages/              # Login, Scanner
├── public/                 # PWA assets
└── docs/                   # n8n workflows
```

## Flow de donnees

```
Scan QR → Parse ID → POST /clinica-checkin → n8n → Google Sheets
                                                  ↓
                                           Response avec visitor info
                                                  ↓
                                           Affichage ScanResult
```

## Auteurs

- **Evensium** - [evensium.com](https://evensium.com)
