# TRD.md — Bikash Bhaiya Classes

## Technical Requirements Document

**Product:** Bikash Bhaiya Classes
**Tagline:** Rato nahi... Samjho...
**Client:** Bikash Chowdhury
**Development Agency:** DevSamp
**Document Version:** 1.0
**Status:** Initial Technical Specification
**Primary Region:** India
**Primary Platforms:** Android, iOS, Windows Web
**Architecture Style:** Modular, Feature-Based, Type-Safe and Server-Secured

---

# 1. Purpose

This document defines the technical architecture, technology stack, application boundaries, database design, authentication, authorization, security, integrations, testing, deployment and maintenance requirements for Bikash Bhaiya Classes.

The implementation must follow this document together with:

* `PRD.md` — Product requirements and scope.
* `ARCHITECTURE.md` — Detailed architecture and system interactions.
* `RULES.md` — Engineering standards and restrictions.
* `DESIGN.md` — UI/UX and design system.
* `TASK.md` — Implementation tasks and progress.
* `MEMORY.md` — Important project decisions and development context.

If these files conflict, do not silently choose an interpretation. Identify the conflict, document it and resolve it before implementing the affected feature.

# 2. Technical Objectives

The system must provide:

1. Android and iOS student applications.
2. A responsive student web application for Windows browsers.
3. A separate administrative web panel.
4. Firebase-based authentication and data management.
5. Consistent course and learning-progress data across platforms.
6. Server-enforced course authorization.
7. One active device session per student.
8. YouTube-based recorded and live video integration.
9. Google Drive-based PDF management.
10. Notices, assignments, notifications and progress tracking.
11. Modular source code with small, focused files.
12. Testable business logic and maintainable integrations.
13. Secure environment and credential management.
14. A documented path for adding future features.

The system must prioritize correctness, security, maintainability and straightforward administration over unnecessary technical complexity.

# 3. Confirmed Technical Scope

## 3.1 Initial Release

* Student phone OTP authentication.
* Student profile management.
* Course catalogue.
* Full-course and single-subject structures.
* Free and demo access.
* Enrollment management.
* Dedicated course classroom.
* Recorded YouTube lectures.
* YouTube Live class scheduling and access.
* Google Drive PDF integration.
* PDF viewing, download and printing.
* Notice board.
* Assignments and submissions.
* Learning-progress tracking.
* Push notifications.
* Coupon definitions and management.
* Device-session management.
* Admin dashboard.
* Student, course and content administration.
* Security rules, tests and deployment documentation.

## 3.2 Not Confirmed for Initial Release

The following must remain outside mandatory implementation scope until explicitly approved:

* Razorpay or another online-payment integration.
* Automatic paid-course enrollment.
* Automatic recording of live classes.
* DRM-protected video streaming.
* Guaranteed prevention of screenshots or recording.
* Offline video downloads.
* Advanced analytics.
* Advanced examination engine.
* Multiple teacher accounts.
* Separate Windows desktop executable.

The architecture may include clean extension points for these features without implementing inactive or misleading functionality.

# 4. Technology Stack

## 4.1 Approved Architecture Direction

| Layer                      | Technology                                               |
| -------------------------- | -------------------------------------------------------- |
| Mobile                     | React Native + Expo + TypeScript                         |
| Android and iOS navigation | Expo Router                                              |
| Student Web                | Next.js + TypeScript                                     |
| Admin Web                  | Next.js + TypeScript                                     |
| Web Styling                | Tailwind CSS                                             |
| Native Styling             | React Native-compatible styling and shared design tokens |
| Authentication             | Firebase Authentication                                  |
| Database                   | Cloud Firestore                                          |
| Trusted Backend            | Firebase Cloud Functions + TypeScript                    |
| Push Notifications         | Firebase Cloud Messaging                                 |
| Content Provider           | YouTube and YouTube Live                                 |
| Document Provider          | Google Drive API                                         |
| Validation                 | Shared TypeScript-compatible schemas                     |
| Testing                    | Unit, integration, security-rule and end-to-end tests    |
| Source Control             | Git and GitHub                                           |
| Deployment                 | Approved web host, Firebase services and app stores      |

Exact package versions must be selected from currently supported, mutually compatible releases and recorded in the lockfile.

Do not use unmaintained packages simply because an AI-generated example recommends them.

## 4.2 Architecture Decision: Separate Web Application

The student web application and admin panel will use Next.js.

The mobile application will use React Native and Expo.

Business rules, data models and validation may be shared through workspace packages. Platform-specific routing, rendering, video-player integration and native capabilities must remain in their respective applications.

Do not force all platforms to use identical UI components when doing so reduces usability or reliability.

## 4.3 Firebase SDK Decision

Use the Firebase JavaScript SDK for supported shared functionality where it satisfies the application's requirements.

Before finalizing authentication, persistence, App Check and native capabilities, verify current compatibility for:

* Expo.
* React Native.
* Android.
* iOS.
* Next.js browser runtime.
* Server-side Cloud Functions.

If a feature requires native Firebase modules, use an appropriate Expo development build and native integration instead of assuming Expo Go supports it.

Phone authentication must be tested on actual supported devices and browsers before production release.

# 5. Repository and Workspace Structure

The project should use a monorepo with separate applications and shared packages.

```
bikash-bhaiya-classes/
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   ├── src/
│   │   │   ├── features/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── providers/
│   │   │   ├── navigation/
│   │   │   └── utils/
│   │   ├── assets/
│   │   ├── tests/
│   │   ├── app.config.ts
│   │   └── package.json
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── features/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── admin/
│       ├── src/
│       │   ├── app/
│       │   ├── features/
│       │   ├── components/
│       │   ├── services/
│       │   └── utils/
│       ├── public/
│       ├── tests/
│       └── package.json
│
├── packages/
│   ├── shared-types/
│   ├── shared-schemas/
│   ├── shared-utils/
│   ├── domain/
│   └── design-tokens/
│
├── functions/
│   └── src/
│       ├── auth/
│       ├── sessions/
│       ├── students/
│       ├── courses/
│       ├── enrollments/
│       ├── content/
│       ├── documents/
│       ├── assignments/
│       ├── notifications/
│       ├── coupons/
│       ├── admin/
│       ├── audit/
│       └── shared/
│
├── firebase/
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── firestore.tests/
│
├── docs/
│   ├── decisions/
│   ├── api/
│   └── operations/
│
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
│
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── PRD.md
├── TRD.md
├── ARCHITECTURE.md
├── RULES.md
├── DESIGN.md
├── TASK.md
└── MEMORY.md
```

This structure is the initial target. Adjust only when a concrete technical need justifies a change.

## 5.1 File Responsibility

* `app/`: Routes, screens and navigation entry points.
* `features/`: Feature-specific UI, hooks, schemas and presentation logic.
* `components/`: Reusable UI components.
* `services/`: External integrations and approved data-access interfaces.
* `hooks/`: Reusable React hooks.
* `utils/`: Small, pure utility functions.
* `shared-types/`: Common TypeScript contracts.
* `shared-schemas/`: Reusable input-validation schemas.
* `domain/`: Shared domain rules that do not depend on UI frameworks.
* `functions/`: Trusted server-side business logic.
* `firebase/`: Firestore security rules and indexes.
* `docs/`: Architecture decisions, API contracts and operational procedures.

Do not create empty abstractions or extra layers without a clear purpose.

# 6. File Size and Code Organization Policy

The codebase must remain easy to understand, debug and extend.

Rules:

1. Each file must have one clear primary responsibility.
2. Prefer approximately 100–200 lines per file when practical.
3. Review files approaching 250–300 lines for decomposition.
4. Split large components into smaller meaningful components.
5. Separate UI rendering from business logic and database operations.
6. Keep validation separate from presentation.
7. Keep backend integrations behind focused service interfaces.
8. Avoid repeated business rules across applications.
9. Avoid circular imports.
10. Avoid excessive fragmentation into meaningless one-line files.
11. Do not shorten files by making names cryptic or logic difficult to follow.
12. Preserve readability over arbitrary line-count limits.

Large configuration files, generated files and data definitions may legitimately exceed these guidelines.

# 7. Application Boundaries

## 7.1 Mobile Application

Responsibilities:

* Mobile-specific user interface.
* Phone OTP flow.
* Session initialization and renewal.
* Course and classroom navigation.
* Video and PDF viewing.
* Push notification registration.
* Device-session activation.
* Progress updates.
* User-facing error and loading states.

The mobile application must not contain privileged administrative credentials or trusted payment-verification logic.

## 7.2 Student Web Application

Responsibilities:

* Responsive student interface.
* Authentication.
* Course browsing.
* Enrollment-aware classroom access.
* Video and PDF access.
* Notices and assignments.
* Progress display.
* Session handling.
* Accessible browser navigation.

Protected web routes must be checked on the server or through trusted authorization mechanisms. Client-side route guards alone are insufficient.

## 7.3 Admin Panel

Responsibilities:

* Administrator authentication.
* Role and permission checks.
* Student management.
* Course and content management.
* Live-class scheduling.
* PDF metadata management.
* Notices and assignments.
* Coupon management.
* Device-session management.
* Reports and audit logs.

All privileged operations must be authorized by trusted backend logic or enforceable security rules.

## 7.4 Cloud Functions

Cloud Functions must own operations that require trusted execution, cross-document consistency or privileged access.

Examples:

* Device-session switching.
* Enrollment creation or revocation.
* Administrator-only mutations.
* Protected Google Drive access.
* Notification dispatch.
* Student import validation.
* Audit-event creation.
* Future payment verification.

Avoid using client-side code as the authority for security-sensitive state changes.

# 8. Authentication and Identity

## 8.1 Authentication Provider

Firebase Authentication will be the primary identity provider.

Phone OTP is the confirmed student login method.

The authentication flow must support:

1. Phone number entry.
2. OTP request.
3. Verification.
4. User record lookup or creation.
5. Student profile completion if required.
6. Device-session activation.
7. Authorized application access.
8. Logout and session revocation handling.

## 8.2 Phone Number Handling

* Normalize phone numbers into a consistent format.
* Use the appropriate country code.
* Validate input before requesting OTP.
* Respect OTP resend cooldowns and service limits.
* Avoid revealing unnecessary account-existence information.
* Handle expired and invalid verification codes.
* Avoid storing OTPs in application documents or logs.

## 8.3 Account Record

Every authenticated user must have a stable internal user identifier associated with the Firebase Authentication UID.

The backend must not trust a user ID supplied by the client without checking it against the authenticated identity.

## 8.4 Authentication Persistence

Session persistence must be configured separately for native applications and browser applications according to supported SDK behaviour.

Native credentials or session material must use suitable platform storage. Browser authentication must use supported secure persistence patterns and protect against cross-site scripting and session theft.

Do not store privileged credentials in local storage.

## 8.5 Administrator Authentication

Administrative access must be separated from ordinary student permissions.

Requirements:

* Explicit administrator authorization.
* Least-privilege roles.
* Server-side permission checks.
* Strong account-recovery procedures.
* Audit logging for sensitive actions.
* No automatic promotion of a student to administrator.

The first administrator must be provisioned through a controlled setup procedure.

Never allow an ordinary user to grant themselves an administrator role.

# 9. Authorization Model

Authentication identifies the user. Authorization determines what that user may do.

Every protected operation must verify:

* The request is authenticated.
* The user is active.
* The requested resource exists.
* The user has the required role.
* The student has valid course or demo access where applicable.
* The active-device policy is satisfied.
* The resource is published and available.
* The requested operation is allowed.

The frontend may hide unavailable actions for usability, but the backend must enforce the actual permissions.

## 9.1 Student Permissions

A student may read permitted profile information, enrolled courses, authorized lectures, notes, notices, assignments and their own progress.

A student must not:

* Read another student's private profile.
* Modify enrollment privileges.
* Publish lectures or notices.
* Change coupon definitions.
* Access administrator data.
* Change authoritative progress or audit records arbitrarily.
* Read private content belonging to another course.

## 9.2 Administrator Permissions

Administrative permissions must be explicit and validated for every privileged action.

Initially, the system may support a single administrator while retaining a role model that permits future expansion.

# 10. One-Active-Device Session Architecture

This is a security-critical subsystem.

## 10.1 Required Behaviour

One student account may have only one active authorized device session at a time across Android, iOS and web.

When a new device is approved:

1. The trusted backend validates the authenticated student.
2. The backend validates the requested operation.
3. The existing active session is identified.
4. The old session is revoked.
5. The new session becomes active.
6. The transition is recorded.
7. Protected access is denied to the old session according to the enforcement policy.

## 10.2 Session Record

A device-session record should contain fields such as:

* `userId`
* `sessionId`
* `platform`
* `status`
* `createdAt`
* `lastSeenAt`
* `revokedAt`
* `revocationReason`
* `appVersion`, when available

Do not collect unnecessary hardware identifiers, precise location or unrelated device information.

## 10.3 Atomic Session Switching

Session activation must use a Firestore transaction or another appropriate atomic mechanism to prevent concurrent device activations from leaving multiple sessions authorized.

The backend must verify that the authenticated account owns the session being activated.

The client must not be allowed to write an authoritative active-session record directly.

## 10.4 Protected Content Enforcement

A Firestore session document alone does not automatically invalidate every existing Firebase ID token.

Therefore:

* Session activation and revocation must be backend-controlled.
* Sensitive content-link issuance must validate the active session.
* Privileged operations must validate the active session.
* Direct Firestore access must use appropriate security rules.
* Where a request cannot be securely checked through rules, route it through a trusted backend.
* Any cached or previously downloaded content must be documented as a separate limitation.

If an authenticated session is revoked, the client should clear protected application state, return to the appropriate authentication screen and explain the reason.

## 10.5 Device Reset

Authorized administrators must be able to reset a student's active session.

The reset operation must:

* Validate administrator permission.
* Revoke the current session.
* Record the action.
* Preserve the student's profile and course enrollment.
* Allow the student to authenticate again.
* Prevent an unauthorized client from resetting another user's session.

# 11. Database Design

Cloud Firestore will be the primary database.

Collection names and fields below are proposed technical contracts. Final field definitions must be maintained consistently in shared TypeScript types and backend validation schemas.

## 11.1 `users`

Purpose: Core user profiles.

Suggested fields:

* `uid`
* `role`
* `fullName`
* `phoneNumber`
* `classLevel`
* `status`
* `createdAt`
* `updatedAt`

Do not store OTPs, passwords or privileged tokens.

## 11.2 `courses`

Purpose: Course catalogue.

Suggested fields:

* `title`
* `slug`
* `description`
* `thumbnailUrl`
* `academicLevel`
* `board`
* `courseType`
* `status`
* `displayOrder`
* `createdAt`
* `updatedAt`

`courseType` may distinguish full courses, single-subject offerings and demo offerings where appropriate.

## 11.3 `subjects`

Purpose: Subject definitions.

Suggested fields:

* `courseId`
* `title`
* `description`
* `displayOrder`
* `status`

## 11.4 `chapters`

Purpose: Course and subject chapter organization.

Suggested fields:

* `courseId`
* `subjectId`
* `title`
* `description`
* `displayOrder`
* `status`

## 11.5 `lectures`

Purpose: Recorded lesson metadata.

Suggested fields:

* `courseId`
* `subjectId`
* `chapterId`
* `title`
* `description`
* `provider`
* `providerVideoId`
* `displayOrder`
* `accessType`
* `status`
* `createdAt`
* `updatedAt`

Do not store unrestricted assumptions about YouTube video privacy or availability in the client.

## 11.6 `liveClasses`

Suggested fields:

* `courseId`
* `subjectId`
* `title`
* `description`
* `scheduledAt`
* `provider`
* `providerVideoId`
* `status`
* `createdAt`
* `updatedAt`

## 11.7 `enrollments`

Suggested fields:

* `studentId`
* `courseId`
* `subjectId`, when applicable
* `source`
* `status`
* `startsAt`
* `expiresAt`, when applicable
* `createdAt`
* `updatedAt`

Enrollment must be authoritative backend-managed data.

## 11.8 `lectureProgress`

Suggested fields:

* `studentId`
* `courseId`
* `lectureId`
* `lastPositionSeconds`, when available
* `completionStatus`
* `completedAt`, when applicable
* `updatedAt`

Progress updates must validate ownership and authorized access.

## 11.9 `pdfs`

Suggested fields:

* `title`
* `description`
* `courseId`
* `subjectId`
* `chapterId`
* `lectureId`, when applicable
* `provider`
* `driveFileId`
* `downloadAllowed`
* `status`
* `createdAt`
* `updatedAt`

Do not make private Google Drive documents publicly accessible merely to simplify downloads.

## 11.10 `notices`

Suggested fields:

* `title`
* `content`
* `targetCourseIds`
* `status`
* `publishedAt`
* `createdAt`
* `updatedAt`

## 11.11 `assignments`

Suggested fields:

* `courseId`
* `subjectId`
* `title`
* `instructions`
* `dueAt`
* `status`
* `createdAt`
* `updatedAt`

## 11.12 `submissions`

Suggested fields:

* `assignmentId`
* `studentId`
* `submissionReferences`
* `status`
* `submittedAt`
* `feedback`
* `marks`, when enabled
* `reviewedAt`

Submission file storage and allowed formats must be finalized before implementation.

## 11.13 `coupons`

Suggested fields:

* `code`
* `discountType`
* `discountValue`
* `startsAt`
* `expiresAt`
* `usageLimit`, when applicable
* `applicableCourseIds`
* `status`
* `createdAt`
* `updatedAt`

Coupon validation must be performed by trusted logic.

## 11.14 `devices`

Purpose: Authoritative device-session metadata.

Suggested fields:

* `userId`
* `sessionId`
* `platform`
* `status`
* `createdAt`
* `lastSeenAt`
* `revokedAt`

The active-session invariant must be enforced by trusted backend logic.

## 11.15 Additional Collections

The system may use:

* `admins`
* `notifications`
* `auditLogs`
* `orders`
* `payments`
* `settings`
* `supportTickets`

Payment-related collections must not be treated as operational payment records until a payment provider and workflow are approved.

# 12. Data Integrity and Indexing

Rules:

* Use stable document identifiers.
* Validate all required fields.
* Store timestamps consistently.
* Avoid unbounded arrays for growing records.
* Use pagination for large result sets.
* Create composite indexes for actual query patterns.
* Use transactions for multi-document state transitions.
* Avoid redundant copies of large data structures.
* Document deletion and retention policies.
* Handle missing related documents safely.
* Avoid storing secrets in Firestore.
* Ensure client-supplied timestamps cannot override authoritative server timestamps for security-sensitive events.

Important query patterns include:

* Published courses by category.
* Subjects by course.
* Chapters by subject.
* Lectures by chapter and display order.
* Enrollments by student.
* Student progress by course.
* Upcoming live classes by scheduled time.
* Notices targeted to a student or course.
* Assignments by course and due date.
* Active device session by student.
* Audit events by target and timestamp.

Firestore indexes must be committed to the repository and deployed with the relevant schema changes.

# 13. Firestore Security Rules

Firestore Security Rules are mandatory.

## 13.1 General Rules

* Deny access by default unless a documented rule permits it.
* Validate the authenticated UID.
* Validate resource ownership.
* Enforce field-level restrictions where needed.
* Prevent students from changing role fields.
* Prevent clients from directly changing authoritative enrollments.
* Prevent clients from writing authoritative device-session state.
* Protect audit logs from client modification.
* Protect unpublished content.
* Protect private student data.
* Keep rules aligned with shared domain permissions.

## 13.2 Backend Privilege

Cloud Functions using privileged server credentials may bypass Firestore Security Rules.

Consequently, every privileged function must implement its own authentication, authorization and input-validation checks.

Never assume Firestore Security Rules automatically protect operations performed by trusted server code.

## 13.3 Rule Testing

Use Firebase Emulator Suite or an equivalent controlled test environment to verify:

* Unauthenticated access is denied.
* Students cannot read other students' private records.
* Students cannot change their roles.
* Unauthorized enrollments cannot be created.
* Unpublished protected content remains inaccessible.
* Administrators can perform only permitted operations.
* Revoked sessions cannot use protected server operations.
* Unexpected field changes are rejected.

Do not deploy permissive test rules to production.

# 14. Backend Service Architecture

Cloud Functions should be divided by domain responsibility.

## 14.1 Authentication and Sessions

Responsibilities:

* Validate authenticated identity.
* Activate sessions.
* Revoke previous sessions.
* Validate session status.
* Handle administrator resets.
* Record relevant security events.

## 14.2 Enrollment Services

Responsibilities:

* Create approved enrollments.
* Validate course availability.
* Apply approved enrollment policies.
* Revoke or expire access.
* Prevent duplicate or invalid enrollment records.

## 14.3 Course Services

Responsibilities:

* Retrieve course metadata.
* Validate publication status.
* Validate access permissions.
* Return authorized course information.

## 14.4 Document Services

Responsibilities:

* Validate the requesting student.
* Validate course access.
* Verify document availability.
* Obtain or issue authorized document access where supported.
* Handle Drive permission and quota errors.

## 14.5 Notification Services

Responsibilities:

* Validate sender permission.
* Determine authorized recipients.
* Dispatch notifications.
* Record relevant notification state.
* Handle invalid device tokens.

## 14.6 Administrative Services

Responsibilities:

* Validate administrator roles.
* Perform privileged mutations.
* Validate bulk imports.
* Write audit events.
* Return safe and structured errors.

Each service must have focused responsibilities and testable business logic.

# 15. API and Function Contracts

Every callable or HTTP function must have a documented contract.

A contract should specify:

* Function name.
* Purpose.
* Authentication requirement.
* Required role.
* Input schema.
* Output schema.
* Error codes.
* Rate limits where applicable.
* Idempotency behaviour.
* Audit requirements.
* Tests.

Suggested logical operations include:

* `activateDeviceSession`
* `revokeDeviceSession`
* `resetStudentDevice`
* `createEnrollment`
* `revokeEnrollment`
* `getAuthorizedCourse`
* `getAuthorizedDocumentAccess`
* `importStudents`
* `publishNotice`
* `submitAssignment`
* `sendNotification`

These names are logical examples, not a mandate to create every function immediately.

Prefer a small number of well-defined functions over a large collection of duplicated wrappers.

Do not expose arbitrary database paths or unrestricted document mutations through generic endpoints.

# 16. Video Integration

## 16.1 Provider

YouTube is the initial recorded-video and live-class provider.

Each lecture must reference a validated YouTube video identifier and associated metadata.

Do not accept arbitrary embed HTML from administrators or store unsanitized markup for direct rendering.

## 16.2 Player Behaviour

The player integration should support, where available:

* Play and pause.
* Playback progress.
* Resume behaviour.
* Previous and next lecture navigation.
* Playback speed.
* Quality controls exposed by the provider.
* Loading and error states.

The application must not assume that every YouTube player exposes the same quality controls or playback events.

## 16.3 Quality Selection

The client requested 480p and 720p.

The actual resolution depends on the source video, YouTube's available streams, player capabilities and network conditions.

The interface must not promise a resolution that the underlying player cannot provide.

## 16.4 Privacy and Content Protection

Unlisted videos are not equivalent to DRM-protected streams.

The implementation must:

* Avoid exposing unnecessary video identifiers in public pages.
* Check course access before displaying protected lecture metadata.
* Use appropriate access controls in the application.
* Document that an authorized student may still share an unlisted video link.
* Avoid claiming complete protection against copying or recording.

If stronger video security becomes a requirement, evaluate a suitable secure video provider separately.

# 17. Google Drive Integration

## 17.1 Integration Model

Google Drive will store learning PDFs.

The backend must manage access to protected files without exposing private service-account credentials to the browser or mobile application.

Use an appropriately authorized Google API integration.

## 17.2 Access Flow

1. Student requests a PDF.
2. The backend validates the authenticated identity.
3. The backend validates the active-device policy.
4. The backend checks enrollment or demo permissions.
5. The backend checks publication and download permissions.
6. The backend obtains or issues the appropriate document access.
7. The client opens or downloads the document.
8. Relevant errors are handled without leaking credentials.

The exact file-delivery approach must be validated against Google Drive API capabilities and access policies before implementation.

## 17.3 Download and Print

Authorized students may download and print permitted PDFs.

Downloaded files cannot be reliably recalled from a device after access has been revoked.

Do not claim that revoking an enrollment deletes previously downloaded copies.

# 18. Push Notification Architecture

Use Firebase Cloud Messaging where supported by the selected native and web configurations.

Requirements:

* Register tokens appropriately.
* Associate tokens with authenticated users.
* Handle token refresh.
* Remove invalid tokens.
* Validate notification-sender permissions.
* Support relevant course or student targeting.
* Avoid sending sensitive student information in notification payloads.
* Handle permission denial.
* Handle offline delivery limitations.
* Test native and web notification configurations separately.

Web push may require additional browser configuration and user permission. It must not be assumed to work identically to native push.

# 19. Coupon Architecture

Coupon management is requested, but online payment is not currently approved.

Therefore:

* Store coupon definitions using validated fields.
* Restrict coupon creation and editing to authorized administrators.
* Validate start and expiry dates.
* Validate applicable course restrictions.
* Validate usage limits if implemented.
* Avoid duplicate active coupon codes where the business rules prohibit them.
* Keep discount calculations out of presentation-only components.

A coupon must not grant paid-course access or create a monetary discount unless an approved enrollment or checkout workflow explicitly supports that operation.

# 20. Payment Extension Architecture

Online payment integration is not part of the confirmed initial release.

Future payment integration must be isolated behind a payment-service interface.

When approved, the future implementation must:

1. Create payment orders through a trusted backend.
2. Use the provider's official SDK or documented API.
3. Verify payment results on the backend.
4. Validate signatures or other provider-required verification.
5. Prevent duplicate order processing.
6. Make payment-processing operations idempotent.
7. Grant paid-course enrollment only after verified success.
8. Record successful, failed and refunded states where supported.
9. Handle interrupted checkout and delayed callbacks.
10. Never trust a client-provided payment-success flag.

Do not add fake payment buttons or pretend payment integration is active.

# 21. Frontend State Management

State must be separated into appropriate categories.

## 21.1 Local UI State

Use local component state for:

* Modal visibility.
* Selected tab.
* Form input.
* Temporary filters.
* Dropdown state.

## 21.2 Server State

Use an appropriate, consistent data-fetching approach for:

* Courses.
* Enrollments.
* Lectures.
* Notices.
* Assignments.
* Progress.
* Device-session status.

Avoid unnecessary duplicate copies of the same server data in multiple state stores.

## 21.3 Authentication State

Authentication state must be managed through a dedicated provider or equivalent abstraction.

Protected routes should wait for authentication initialization before redirecting users.

Avoid flashing protected pages or showing incorrect signed-out states while the authentication session is loading.

## 21.4 Shared Business Logic

Business rules that must match across platforms should be centralized in shared domain modules or enforced authoritatively on the backend.

Do not rely on frontend validation alone for authorization, enrollment or coupon eligibility.

# 22. UI and Error Handling

Every major data-driven screen must support:

* Initial loading.
* Successful data display.
* Empty state.
* Recoverable error.
* Permission-denied state.
* Expired-session state.
* Offline or network-error state where appropriate.

Requirements:

* Use consistent error messages.
* Avoid exposing stack traces or private backend details to users.
* Log actionable technical errors securely.
* Preserve safe user input after recoverable failures where practical.
* Ask for confirmation before destructive administrative operations.
* Avoid indefinite loading indicators.
* Prevent duplicate form submission where necessary.

The interface must remain responsive on Android, iOS and supported Windows browsers.

# 23. Performance Requirements

The implementation must avoid unnecessary work and excessive database reads.

Required practices:

* Paginate large student and course lists.
* Fetch only necessary fields.
* Use appropriate Firestore indexes.
* Load lecture metadata on demand.
* Avoid downloading full course datasets on every screen.
* Optimize images and thumbnails.
* Avoid redundant state updates.
* Avoid expensive computations during every render.
* Use suitable caching for non-sensitive metadata.
* Do not cache authorization decisions indefinitely.
* Handle slow internet and failed requests.
* Avoid unnecessary polling.
* Measure performance before introducing complex optimizations.

Video playback quality and buffering depend partly on the network and YouTube delivery. The application cannot guarantee uninterrupted playback on every connection.

# 24. Accessibility and Responsive Behaviour

## 24.1 Mobile

* Support practical touch-target sizes.
* Use native-appropriate navigation.
* Handle keyboard and safe-area layouts.
* Provide readable text.
* Avoid clipped content.
* Support portrait layouts and other orientations where needed.
* Test on common Android and iOS devices.

## 24.2 Web

* Support common laptop and desktop widths.
* Support Windows Chrome and Edge.
* Provide keyboard-accessible controls.
* Use semantic HTML.
* Maintain visible focus states.
* Ensure forms have labels.
* Avoid horizontal overflow.
* Ensure the classroom layout adapts to smaller screens.

# 25. Environment and Configuration

Maintain separate configurations for development, testing and production.

Recommended environment categories:

* `development`
* `test`
* `production`

Use `.env.example` to document required variable names without real secrets.

Requirements:

* Never commit private credentials.
* Never commit service-account JSON files.
* Never include privileged API secrets in client bundles.
* Keep server-only configuration on trusted infrastructure.
* Validate required configuration during startup.
* Fail clearly when required configuration is missing.
* Use the correct Firebase project for each environment.
* Prevent accidental production writes during local testing.

Firebase public client configuration is not equivalent to a server secret. Security must be enforced through authentication, rules, App Check and trusted backend logic rather than relying on hiding public configuration values.

# 26. Testing Strategy

## 26.1 Unit Tests

Test pure business logic, including:

* Enrollment eligibility.
* Course-access conditions.
* Coupon validation.
* Progress calculations.
* Session state transitions.
* Role and permission checks.
* Input schemas.
* Error mapping.

## 26.2 Integration Tests

Test interactions between application services and Firebase emulators or controlled test environments.

Important cases:

* Profile creation after authentication.
* Course retrieval.
* Enrollment creation and revocation.
* Protected lecture access.
* Protected PDF access.
* Notice retrieval.
* Assignment submission.
* Device activation.
* Device switching.
* Administrative device reset.
* Notification dispatch.
* Bulk student import.

## 26.3 Security Tests

Verify:

* Unauthenticated requests cannot read protected data.
* Students cannot access another student's private data.
* Students cannot elevate their own role.
* Students cannot modify authoritative enrollment records.
* Revoked sessions cannot perform protected backend operations.
* Unpublished content remains protected.
* Private credentials do not appear in client bundles.
* Invalid function inputs are rejected.
* Concurrent device activation does not leave multiple sessions authorized.
* Privileged administrative functions reject unauthorized users.

## 26.4 End-to-End Tests

Test the complete user journeys:

1. Student authenticates.
2. Student opens My Learning.
3. Student opens an enrolled course.
4. Classroom loads.
5. Student opens a recorded lecture.
6. Progress is saved.
7. Student opens or downloads a permitted PDF.
8. Student views a notice.
9. Student views an assignment.
10. Student switches devices and the previous session is revoked.
11. Administrator adds a course and publishes content.
12. Administrator resets a student's device.

Run appropriate tests on Android, iOS and Windows web.

# 27. Logging and Monitoring

Logging must support debugging without exposing private information.

Record relevant technical events such as:

* Function errors.
* Failed validation.
* Session activation and revocation.
* Enrollment mutations.
* Failed document-access attempts.
* Administrative changes.
* Deployment errors.

Requirements:

* Do not log OTP values.
* Do not log passwords or private tokens.
* Avoid unnecessary personal information.
* Use structured log fields where supported.
* Add correlation identifiers where practical.
* Restrict access to production logs.
* Document how errors are reviewed.
* Configure an approved crash-reporting solution if required.

# 28. CI/CD and Version Control

## 28.1 Git Workflow

* Keep `main` stable.
* Use feature branches for meaningful changes.
* Write descriptive commits.
* Review changes before merging.
* Avoid committing generated secrets or local configuration.
* Keep dependency lockfiles committed.
* Document database and security-rule changes.

## 28.2 Automated Checks

Where practical, the repository should run:

* TypeScript type checking.
* Linting.
* Formatting checks.
* Unit tests.
* Security-rule tests.
* Relevant production builds.

A change that breaks critical tests or exposes private credentials must not be treated as release-ready.

## 28.3 Deployment

* Separate preview and production deployments.
* Review configuration before release.
* Deploy rules and indexes with coordinated changes.
* Validate the production build.
* Maintain a rollback procedure.
* Avoid automatic production deployment of unreviewed security-sensitive changes.

# 29. Backup, Recovery and Data Lifecycle

The project must define backup and recovery procedures for important data.

Requirements:

* Document which data requires backup.
* Evaluate appropriate Firestore backup/export options.
* Define backup frequency based on the client's needs and budget.
* Document restoration steps.
* Test restoration periodically where practical.
* Document account ownership and recovery contacts.
* Define retention and deletion policies for student records.
* Preserve auditability for sensitive administrative actions.
* Avoid assuming that Google Drive, Firestore or GitHub alone provides a complete recovery strategy.

Backup services, retention and storage costs must be reviewed before production.

# 30. Privacy and Compliance

The application processes student contact details and learning activity.

Requirements:

* Collect only necessary personal information.
* Restrict access by role.
* Protect personal information in logs.
* Publish an appropriate privacy policy before public release.
* Document data retention and deletion procedures.
* Review applicable Indian data-protection requirements.
* Review Google Play and Apple App Store policies.
* Review applicable rules for minors and parental consent where required.
* Obtain appropriate permissions for educational content.
* Document account deletion and data-access handling.

Legal and platform requirements must be verified against current official guidance before release.

# 31. Deployment Architecture

## 31.1 Firebase

The client does not yet have a Firebase project.

Required setup:

* Create the production Firebase project.
* Register the required application clients.
* Configure phone authentication.
* Create Firestore.
* Deploy security rules.
* Deploy indexes.
* Configure Cloud Functions.
* Configure App Check where supported.
* Configure push notifications.
* Review usage quotas and billing.
* Establish backup and recovery procedures.

Select the production database region based on service availability, user location, data-residency needs and migration implications.

## 31.2 Android

Requirements:

* Stable application identifier.
* Release signing.
* Production Firebase configuration.
* Release build testing.
* Play Console configuration.
* Privacy and store disclosures.
* App listing assets.
* Release validation.

## 31.3 iOS

Requirements:

* Bundle identifier.
* Apple signing and provisioning.
* Production Firebase configuration.
* Supported iOS build.
* App Store Connect setup.
* Privacy disclosures.
* Device testing.
* TestFlight and release validation.

## 31.4 Web

Requirements:

* Approved hosting provider.
* Production domain and HTTPS.
* Secure environment configuration.
* Authentication redirect configuration.
* Production build checks.
* Error monitoring.
* Rollback process.
* Appropriate security headers.

# 32. Failure Handling

The application must define predictable behaviour for common failures.

| Failure                            | Expected Handling                                                 |
| ---------------------------------- | ----------------------------------------------------------------- |
| OTP fails                          | Show a safe error and allow a permitted retry                     |
| Authentication expires             | Re-authenticate and restore the correct route where practical     |
| Device session revoked             | Clear protected state and explain that another session is active  |
| Course access denied               | Show an access message and avoid exposing protected content       |
| YouTube video unavailable          | Show a clear playback error and provide a retry option            |
| Google Drive file missing          | Show an unavailable-document message                              |
| Notification permission denied     | Keep core application functionality available                     |
| Network interruption               | Show retry options and preserve safe state                        |
| Firestore operation fails          | Show a recoverable error and log useful diagnostics               |
| Admin import contains invalid rows | Report row-level errors and avoid silently accepting invalid data |
| Duplicate operation occurs         | Apply idempotency or duplicate detection where required           |

# 33. Release Readiness Checklist

Before production release, verify:

* [ ] PRD and technical decisions are up to date.
* [ ] Environment configuration is documented.
* [ ] Firebase Authentication is configured.
* [ ] Firestore security rules are deployed and tested.
* [ ] Required indexes are deployed.
* [ ] Cloud Functions have authorization checks.
* [ ] One-device enforcement has passed concurrency tests.
* [ ] Course enrollment and access have passed tests.
* [ ] YouTube integration has been validated.
* [ ] Google Drive access has been validated.
* [ ] Android application has been tested.
* [ ] iOS application has been tested.
* [ ] Windows web has been tested.
* [ ] Administrative permissions have been tested.
* [ ] Privacy and platform requirements have been reviewed.
* [ ] Backup and recovery procedures are documented.
* [ ] Production credentials are protected.
* [ ] No known critical security defects remain unresolved.
* [ ] Client acceptance testing is complete.

# 34. AI Coding Agent Rules

Any AI coding agent working on this repository must follow these requirements:

1. Read PRD.md and TRD.md before major implementation work.
2. Read ARCHITECTURE.md, RULES.md, DESIGN.md, TASK.md and MEMORY.md whenever they exist.
3. Inspect the current codebase before creating or modifying files.
4. Do not recreate working modules without a clear reason.
5. Do not silently change the selected technology stack.
6. Do not invent missing client requirements.
7. Do not implement unapproved paid services.
8. Keep files focused and modular.
9. Use TypeScript and avoid unnecessary `any`.
10. Validate untrusted inputs.
11. Enforce authorization on the backend.
12. Never expose privileged credentials to client code.
13. Do not weaken security rules to bypass an implementation problem.
14. Do not use fake production data to simulate completed features.
15. Implement loading, empty and error states.
16. Add tests for important business rules.
17. Run relevant tests and builds after significant changes.
18. Update documentation when contracts or architecture change.
19. Document unresolved decisions.
20. Make changes incrementally and preserve existing functionality.
21. Do not claim a build, test or deployment succeeded unless it was actually verified.
22. Do not mark a feature complete merely because its UI has been created.

# 35. Technical Decision Records

Significant architectural decisions must be documented under `docs/decisions/`.

Each decision record should contain:

* Decision title.
* Date.
* Context.
* Problem being solved.
* Options considered.
* Selected option.
* Reasons for the decision.
* Consequences and limitations.
* Migration or rollback considerations.

Important decisions include:

* Firebase SDK selection.
* Authentication implementation.
* One-device enforcement design.
* Google Drive document-delivery mechanism.
* Video-player integration.
* Hosting provider.
* Database region.
* Backup strategy.
* Future payment architecture.

Do not introduce major architectural changes without documenting the reason.

# 36. Official Technical References

Use current official documentation to verify implementation details, compatibility, security and platform policies.

* Expo Firebase Integration: https://docs.expo.dev/guides/using-firebase/
* Expo Authentication: https://docs.expo.dev/guides/using-authentication/
* Expo Router: https://docs.expo.dev/router/introduction/
* Next.js Documentation: https://nextjs.org/docs
* Firebase Authentication: https://firebase.google.com/docs/auth
* Cloud Firestore: https://firebase.google.com/docs/firestore
* Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
* Firebase App Check: https://firebase.google.com/docs/app-check
* Firebase Cloud Functions: https://firebase.google.com/docs/functions
* Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
* Firebase Emulator Suite: https://firebase.google.com/docs/emulator-suite
* Google Drive API: https://developers.google.com/drive/api/guides/about-sdk
* YouTube IFrame Player API: https://developers.google.com/youtube/iframe_api_reference
* YouTube Data API: https://developers.google.com/youtube/v3

Verify package versions and API behaviour before implementation. Official documentation should take precedence over outdated tutorials or unverified AI-generated examples.

# 37. Final Technical Definition

Bikash Bhaiya Classes will use a modular multi-application architecture consisting of:

* React Native + Expo mobile application.
* Next.js student web application.
* Next.js administrative panel.
* Firebase Authentication.
* Cloud Firestore.
* Trusted TypeScript Cloud Functions.
* Firebase Cloud Messaging.
* YouTube recorded and live video integration.
* Google Drive PDF integration.
* Server-enforced course authorization.
* One-active-device session policy.
* Shared domain types and validation.
* Automated testing and security-rule validation.
* Documented deployment, recovery and maintenance procedures.

The final implementation must remain aligned with the approved PRD, preserve the modular code structure and prioritize secure, maintainable and testable engineering over shortcuts.

**End of TRD.md**
