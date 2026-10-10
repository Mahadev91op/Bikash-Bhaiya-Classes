# Admin Security and Authentication

## Principles
The administration panel manages critical course data, student enrollments, and system configurations. Security relies on strict server-side validation.

## Authentication Flow
1. The admin authenticates using Firebase Authentication via the Admin Web application (`apps/admin`).
2. The client application checks the user's custom claim or a secure `roles` document to display the dashboard. **This is only for UX, not true security.**

## Authorization (The True Security)
1. **Firestore Rules**: Firestore rules (`firebase/firestore.rules`) must explicitly allow writes to courses, students, and sessions *only* if the `request.auth.token.role == 'admin'`.
2. **Cloud Functions**: Any callable function executing privileged tasks (e.g., student imports, bulk course updates) verifies the caller's admin claim before proceeding.
3. **No Direct Writes**: Clients should not be permitted to directly grant themselves roles or modify security-sensitive fields.

## Provisioning
Initial administrators must be provisioned securely, typically by running a one-off Cloud Function or using a custom script locally with the Admin SDK to set the `admin` custom claim on a trusted user's UID.
