@AGENTS.md

# Gaia Garden Mobile

Mobile app (Android and iOS) for Gaia Garden, an IoT platform for monitoring indoor grow environments.
Users own **habitats**. Devices send temperature and humidity readings (**telemetry**), and the backend calculates VPD.
This app signs users in and shows the latest reading of each habitat.
Flow: **App → NestJS API**. It does not use the web app's BFF.

## Stack
Expo SDK 58, React Native, Expo Router, TypeScript (strict), TanStack Query, Zod, `StyleSheet`, npm. Path alias: `@/*` → `src/*`.
There is no browser target: the session needs the platform's secure storage.

## Commands
- `npm start`: dev server (copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` first)
- `npm run typecheck`, `npm run lint`, `npm test`: run all three before calling a task done
- `npm audit`: there must be no high or critical issues

## Structure
- `src/app/`: routes only. `index` and `login` are public; everything in `(protected)/` needs a session.
- `src/components/`: shared UI.
- `src/theme/`: design tokens, named like the web's `gaia-*` tokens.
- `src/lib/api/`: `httpClient` (transport), `apiClient` (authenticated calls), one typed client per domain.
- `src/lib/auth/`: session, token storage, sign-in.
- `src/lib/context/`: current user and selected habitat.
- `src/lib/schemas/`: Zod schemas and the types derived from them.
- `src/testing/`: test helpers. Tests live in `__tests__/` folders, never in `src/app/`.

## Key rules
- **Thin client.** No domain logic: never calculate VPD or any other domain value. Labels and colors are presentation only.
- **Ownership comes from the JWT.** Never send `userId`.
- **Authenticated calls go through `apiClient`**, which adds the Bearer token and ends the session on 401/403. Never handle those per screen.
- **Only Home and Login are public.** New screens go in `(protected)/`.
- **Screens use theme tokens only**, never raw color values.
- **Generic naming**: plants, habitats, telemetry. Never crop-specific.
- **English** for code, comments and UI copy.
- Every data screen has loading, empty, error (with Retry) and data states.
- Don't guess API contracts. Read the backend code or ask.

## Security baseline (OWASP MASVS L1)
- The token lives only in secure storage (`tokenStorage.ts`) and in the session module's memory. Never in AsyncStorage, files, logs, navigation params or app state. There is no insecure fallback.
- Logout, 401/403, an expired token or a failed restore wipes the token, the user and cached responses.
- HTTPS only. Plain HTTP is allowed only to localhost (and the Android emulator's `10.0.2.2`) in dev builds.
- No secrets in the app: every `EXPO_PUBLIC_*` value is public.
- No `console` calls. Never show server error text or render API data as HTML.

### Future hardening (out of scope for now)
Certificate pinning, jailbreak/root detection, biometrics, refresh tokens.
