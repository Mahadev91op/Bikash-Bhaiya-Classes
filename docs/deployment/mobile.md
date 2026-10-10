# Mobile App Deployment

## Overview
The student mobile application (`apps/mobile`) is built with Expo (React Native).

## Building with EAS (Expo Application Services)
1. Navigate to the mobile app directory: `cd apps/mobile`
2. Ensure you are logged in: `eas login`
3. Configure the project if not already done: `eas build:configure`

### Android Build
To generate an APK for testing or an AAB for the Play Store:
```bash
eas build --platform android --profile preview
```

### iOS Build
iOS requires an Apple Developer account.
To generate a build:
```bash
eas build --platform ios
```

## Environment Config
Mobile environment variables (e.g., Firebase Client Config) should be placed in `apps/mobile/.env` or configured through EAS secrets for cloud builds. Do not store secrets like Admin SDK keys here.
