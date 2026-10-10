# Local Development Setup

## Prerequisites
- Node.js (v18 or v20 recommended)
- Firebase CLI (`npm install -g firebase-tools`)
- EAS CLI (for mobile, `npm install -g eas-cli`)

## Installation
At the repository root, run:
```bash
npm install
```
This will install dependencies across all workspaces.

## Environment Variables
1. Ensure you have the Firebase project initialized or have an emulator set up.
2. Copy `.env.example` in the root to individual application directories (e.g., `apps/student-web/.env.local`, `apps/admin/.env.local`).
3. Fill in the required placeholder variables with actual configuration.

## Starting the Apps
Start each app independently as needed:
- **Mobile**: `npm run dev:mobile` (from root) or `npm start` in `apps/mobile`.
- **Student Web**: `npm run dev:student` (from root) or `npm run dev` in `apps/student-web`.
- **Admin Web**: `npm run dev:admin` (from root) or `npm run dev` in `apps/admin`.
- **Firebase Emulators**: `npm run dev:functions` (from root).
