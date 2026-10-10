# MEMORY.md — Bikash Bhaiya Classes

## Confirmed Project Facts
- **Product Name**: Bikash Bhaiya Classes
- **Developer**: DevSamp
- **Target Audience**: Class 10, Class 12, Commerce (WBBSE/WBCHSE boards).
- **Initial Scale**: ~100-150 students, ~5-15 recorded lectures initially.

## Approved Stack
- **Mobile**: React Native / Expo
- **Web**: Next.js (Student & Admin)
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Video Platform**: YouTube
- **Notes Platform**: Google Drive or Firebase Storage (TBD based on limits)
- **Monorepo Tooling**: NPM Workspaces

## Architectural Decisions
- Centralized monorepo for all apps and shared libraries.
- Strict one-active-device policy enforced via server-side session management.
- Complete separation between Admin operations and Student client logic.

## Known Limitations / Open Questions
- Payment gateway integration (e.g., Razorpay) is deferred until required.
- YouTube video protection is inherently limited; users with links may still share them unless strict unlisted/private access is managed, which will be documented.
- Exact push notification integration strategy depending on Apple/Google developer accounts availability.
