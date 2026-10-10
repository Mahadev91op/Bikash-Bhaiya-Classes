# Admin Web Deployment

## Overview
The admin web application (`apps/admin`) is built with Next.js and is strictly separated from the student app. It handles all privileged UI operations.

## Build Process
To build the application for production:
```bash
npm run build --workspace=apps/admin
```

## Hosting Setup
The admin application must be deployed to its own isolated domain (e.g., `admin.example.com`).
1. **Root Directory**: Set the root directory to `apps/admin`.
2. **Build Command**: `npm run build`
3. **Environment Variables**: Configure the Firebase client API keys. Admin credentials (Admin SDK) should NEVER be included here, as Next.js API routes will be relying on Cloud Functions, or if API routes are used, configure server-side env vars only.

This app relies on server-side authorization checks on the Firebase Backend, ensuring UI access isn't the only line of defense.
