# Bikash Bhaiya Classes

Bikash Bhaiya Classes is an online educational platform offering recorded lectures, live classes, notes, and assignments to students.

## System Architecture
This repository is a monorepo managing three primary applications:
1. **Mobile App**: Student Android/iOS app (`apps/mobile`)
2. **Student Web App**: Responsive portal for students (`apps/student-web`)
3. **Admin Web App**: Administrative dashboard (`apps/admin`)

Backend services are powered by Firebase.

## Prerequisites
- Node.js (v18 or v20 recommended)
- NPM (v8+)
- Firebase CLI (`npm install -g firebase-tools`)
- Expo CLI (`npm install -g eas-cli`)

## Installation
1. Clone the repository.
2. Run `npm install` at the root directory to install all workspace dependencies.
3. Copy `.env.example` to `.env.local` in the respective application directories and fill in the Firebase credentials.

## Running the Applications

**Mobile App**
```bash
npm run dev:mobile
```

**Student Web App**
```bash
npm run dev:student
```

**Admin Web App**
```bash
npm run dev:admin
```

**Firebase Functions / Emulators**
```bash
npm run dev:functions
```

## Testing and Linting
- `npm run lint`: Run ESLint across all workspaces.
- `npm run typecheck`: Run TypeScript compilation checks.
- `npm run test`: Run the test suites.

## Deployment
See `docs/deployment/` for detailed deployment instructions.
