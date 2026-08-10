# Android Build and Internal Testing

## Local Test Build

Build a debug APK with:

```bash
npm run mobile:build:debug
```

Install `android/app/build/outputs/apk/debug/app-debug.apk` through Android Studio or `adb`.

## Play Internal Test Bundle

Google Play requires a release-signed Android App Bundle.

1. Generate and securely back up a release keystore:

```bash
keytool -genkeypair -v -keystore mobile/android/release.keystore -alias ebisu -keyalg RSA -keysize 4096 -validity 10000
```

2. Copy `mobile/android/keystore.properties.example` to `mobile/android/keystore.properties` and replace every placeholder.
3. Build the signed bundle:

```bash
npm run mobile:build:bundle
```

4. Upload `mobile/android/app/build/outputs/bundle/release/app-release.aab` to the Google Play Console Internal testing track.

The keystore and `keystore.properties` are intentionally ignored by Git. Losing the upload key can block future updates, so store it in a password manager or secure secrets vault.

## Before Uploading

- Increment `versionCode` and `versionName` in `android/app/build.gradle` for every Play upload.
- Create the app in Play Console with package ID `com.ebisutracker.app`.
- Complete the store listing, privacy policy, Data safety, and content rating forms.
- Add internal testers and validate login, logout, navigation, and core finance flows.
