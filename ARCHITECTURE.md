# ARCHITECTURE.md — Bikash Bhaiya Classes

## System Architecture
The Bikash Bhaiya Classes platform is designed as a multi-platform ecosystem:
- **Mobile App**: Built with Expo (React Native) for Android and iOS.
- **Student Web App**: Built with Next.js for responsive browser access.
- **Admin Web App**: Built with Next.js for platform administration.
- **Backend**: Firebase Authentication, Cloud Firestore, Cloud Storage, and Firebase Cloud Functions.

## Monorepo Structure
The project uses NPM Workspaces to manage multiple applications and shared packages:
- `apps/mobile`: Expo application for students.
- `apps/student-web`: Next.js application for students.
- `apps/admin`: Next.js application for administrators.
- `packages/*`: Shared logic, types, validation schemas, and design tokens.
- `functions`: Firebase Cloud Functions for backend logic.

## Data Flow
- Clients interact directly with Firestore for read operations using the Firebase Client SDK.
- Protected writes (e.g., enrollments, assignments) are handled via Callable Cloud Functions to enforce strict authorization and data integrity.
- File uploads are managed via Firebase Storage with strict security rules, or through Google Drive integrations as specified.

## Authentication and Authorization
- Firebase Authentication is used for user identity.
- Custom claims or a dedicated `users` collection determines roles (e.g., student vs. admin).
- Firestore Security Rules enforce access control at the database level.

## Session Management
- A single active session per student is enforced.
- When a user logs in, the server generates/updates a session record in the `sessions` collection.
- Clients subscribe to their session document; if it is revoked or overridden by another login, the client must log out.

## Video and PDF Architecture
- **Video**: Uses third-party providers (e.g., YouTube) as per requirements. Metadata and URLs are stored in Firestore.
- **PDFs**: Notes and assignments are stored in Firebase Storage or linked from Google Drive. Access is validated before surfacing the URLs to the UI.
