# Mobile Roadmap

## Current Direction

Use a hybrid Capacitor rollout: ship the Android shell with the hosted Ebisu web experience first, while keeping the existing browser authentication flow intact.

## Required Follow-Up: Native Authentication

Before treating the Android app as a fully native secure client, implement native authentication and migrate mobile sessions away from WebView `localStorage`:

- Create native Android login and logout flows that call the API directly.
- Store refresh tokens using Android Keystore-backed secure storage.
- Use short-lived access tokens and rotating refresh tokens, with device-session revocation in the API.
- Offer biometric app lock with device-PIN fallback after successful login.
- Create an Android Google OAuth client using the release signing SHA-1/SHA-256 fingerprints and allow its audience in the API.
- Add Play Integrity request verification in audit mode, then enforce only after internal and closed testing validates it.
- Do not bypass Turnstile based on user agent; native authentication must instead use API rate limits and Play Integrity.

## Rollout Checklist

- Add a `mobile/` Capacitor workspace for `com.ebisutracker.app` pointed at `https://ebisutracker.com`.
- Add API authentication and general rate limits.
- Configure Android app signing, Play Integrity, and an internal Play testing track.
- Complete the native authentication migration above before claiming Keystore-protected mobile credentials.
