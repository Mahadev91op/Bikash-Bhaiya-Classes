# RULES.md — Bikash Bhaiya Classes

## Coding Standards
1. **TypeScript**: Use strict mode. Avoid `any` - use explicit types or `unknown` with type narrowing.
2. **File Organization**: Group by feature, not by technical role. Do not put the entire application in a single file. Keep components focused.
3. **Component Boundaries**: Separate UI components from domain logic and data access. Use hooks for data fetching and state management.
4. **Naming**: Use camelCase for variables/functions, PascalCase for components/classes. Name files according to their primary export.

## Error Handling & Logging
1. Do not use silent catch blocks. Log meaningful errors.
2. Display user-friendly error messages in the UI.
3. Avoid logging sensitive information (e.g., passwords, private URLs).

## Security
1. **Never commit secrets**: Keep `.env` files out of source control. Use `.env.example` for placeholders.
2. **Client vs Server**: Never initialize Firebase Admin SDK in client code.
3. **Authorization**: Verify permissions on the server (Firestore Rules or Cloud Functions). Do not rely on client-side booleans for security.

## Dependency Management
1. Only install strictly necessary dependencies.
2. Prefer stable, widely-supported packages over experimental ones.
