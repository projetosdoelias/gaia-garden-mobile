# Gaia Garden Mobile

Android and iOS app for Gaia Garden, an IoT platform for monitoring indoor grow environments.
Built with Expo. See [CLAUDE.md](CLAUDE.md) for the structure and rules.

## Run

```bash
npm install
cp .env.example .env   # then set EXPO_PUBLIC_API_URL
npx expo start --clear # press "a" for Android, "i" for iOS (macOS), or scan the QR code
```

Restart with `--clear` after changing `.env`.

| Where the app runs | API | `EXPO_PUBLIC_API_URL` |
|---|---|---|
| Android emulator | local | `http://10.0.2.2:3000` |
| iOS simulator | local | `http://localhost:3000` |
| Android phone over USB | local | `http://localhost:3000`, after `adb reverse tcp:3000 tcp:3000` |
| Any device | production | `https://<your API host>` |

Release builds accept HTTPS only. For a native iOS development build, set `APP_VARIANT=development`
when running `npx expo run:ios`, so it can reach the local network. Never set it for a release build.

## Check

```bash
npm run typecheck
npm run lint
npm test
npm audit
```
