# Firebase Backend Deployment

## Overview
The Firebase backend includes Cloud Firestore rules, Storage rules, indexes, and Cloud Functions located in the `functions/` and `firebase/` directories.

## Cloud Functions
The Cloud Functions handle all secure backend logic (e.g., user session validation, enrollment, and administrative changes).

To build functions:
```bash
npm run build --workspace=functions
```

To deploy functions:
```bash
firebase deploy --only functions
```

## Security Rules and Indexes
To deploy Firestore rules and indexes:
```bash
firebase deploy --only firestore
```

## Production Safety
Always test changes locally using the Firebase Local Emulator Suite before deploying to production.
```bash
firebase emulators:start
```
Never commit the `.firebase` cache or `firebase-debug.log`. Ensure the correct Firebase project is selected (`firebase use <project-id>`).
