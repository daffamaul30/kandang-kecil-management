# Kandang Kecil

Personal poultry-management application. Read `PRD.md` for agreed scope.

## Local setup
- Node.js 20+
- `npm install`
- Copy `.env.example` to `.env.local`, set MongoDB URI/database, APP_USERNAME, APP_PASSWORD, and a long SESSION_SECRET.
- `npm run dev`

## Notes
- Single-user app; no public registration.
- Never commit `.env.local` or secrets.
- Feeder UI is configuration/demo only until ESP32 integration and device testing.
- Reports support date filtering and CSV export.
