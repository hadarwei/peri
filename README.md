# peri

A local-only, fun period tracker for iPhone (Expo / React Native). All data stays on the device.

## Run

```bash
npm install
EXPO_NO_TELEMETRY=1 npx expo start
```

Open **Expo Go** on your iPhone, scan the QR code (same Wi-Fi as the computer).

## Scripts

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `npm run typecheck`     | TypeScript check                               |
| `npm run lint`          | ESLint + Prettier                              |
| `npm test`              | Jest unit tests                                |
| `npm run check:privacy` | Fails if network calls appear in `src/`/`app/` |

## Privacy

- No analytics, no accounts, no network calls from app code.
- `expo-updates` is not installed (no remote code updates). Do not add it.
- Set `EXPO_NO_TELEMETRY=1` to disable Expo CLI telemetry.
