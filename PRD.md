# PRD.md — Bikash Bhaiya Classes

**Product Requirements Document (PRD)**

| Document Information      | Details                                   |
| ------------------------- | ----------------------------------------- |
| Product Name              | Bikash Bhaiya Classes                     |
| Tagline                   | Rato nahi... Samjho...                    |
| Developed By              | DevSamp                                   |
| Client / Owner            | Bikash Chowdhury                          |
| Document Version          | 1.0                                       |
| Status                    | Initial Product Specification             |
| Primary Region            | West Bengal, India                        |
| Primary Language          | Hindi / English, configurable             |
| Primary Audience          | Class 10, Class 12 and Commerce students  |
| Initial Student Base      | Approximately 100–150 students            |
| Initial Recorded Lectures | Approximately 5; expected 10–15 at launch |
| Primary Theme             | Blue, clean, simple and student-friendly  |

---

# 1. Product Overview

Bikash Bhaiya Classes is an online educational platform designed to help students access recorded lectures, live classes, notes, assignments, announcements and course progress through a single student account.

The platform will support Android smartphones, Apple devices (iPhone/iPad) and Windows computers through a browser-based web application.

The system will contain three primary applications:

1. **Student Mobile App:** Android and iOS.
2. **Student Web Application:** Responsive website for Windows PCs, laptops and supported mobile browsers.
3. **Admin Panel:** Web-based control panel for managing students, courses, lectures, learning materials, notices, assignments and access permissions.

The platform should prioritize simplicity, reliable video playback, controlled course access, maintainable code and straightforward administration.

## 1.1 Product Vision

Build a reliable, easy-to-use digital learning platform that allows students to study anytime, from supported devices, while allowing the coaching administrator to manage educational content without needing technical knowledge.

## 1.2 Core Principles

* Simple and intuitive user experience.
* Consistent course access across supported platforms.
* Secure authentication and server-enforced authorization.
* Modular, maintainable and testable code.
* Reusable components and shared business rules.
* Clear separation between student, teacher and administrator permissions.
* Transparent third-party service costs.
* No false promises about video piracy prevention.
* Architecture that supports future expansion without unnecessary complexity.

---

# 2. Client Requirements

The following requirements are based on the submitted client questionnaire.

| Requirement                  | Confirmed Selection                               |
| ---------------------------- | ------------------------------------------------- |
| Institute name               | Bikash Bhaiya Classes                             |
| Tagline                      | Rato nahi... Samjho...                            |
| Existing students            | 100–150                                           |
| Education levels             | Class 10, Class 12 and Commerce                   |
| Boards                       | WBBSE and WBCHSE                                  |
| Student login                | Phone OTP                                         |
| Student profile              | Name, phone number and class                      |
| Full course                  | Required                                          |
| Single-subject courses       | Required                                          |
| Free/demo courses            | Required                                          |
| Recorded lectures            | Required                                          |
| YouTube recorded videos      | Yes                                               |
| Live classes                 | Yes                                               |
| Live class platform          | YouTube                                           |
| PDF notes                    | Required                                          |
| PDF downloading and printing | Allowed                                           |
| Notice board                 | Required                                          |
| Assignments/homework         | Required                                          |
| Learning progress            | Required                                          |
| Online payments              | Not currently required                            |
| Razorpay account             | Not available                                     |
| Coupons/discounts            | Required                                          |
| Automatic course unlocking   | Requested, payment workflow requires confirmation |
| Device control               | Required; one active device per student           |
| Push notifications           | Required                                          |
| Firebase project             | Not yet available                                 |
| Google Drive                 | Available                                         |
| Google Play Console account  | Not yet available                                 |
| Apple Developer account      | Not yet available                                 |
| Design preference            | Blue theme, simple interface                      |
| Video screen protection      | Requested, subject to technical limitations       |
| Number of administrators     | One initially                                     |

**Important scope rule:** Requirements marked as future-ready or pending confirmation must not be treated as fully approved features. Any conflicting requirements must be clarified before implementation.

---

# 3. Platforms and Cross-Platform Access

## 3.1 Android Application

The Android application must allow students to:

* Log in using phone OTP.
* View available and enrolled courses.
* Open their course classroom.
* Watch recorded lectures.
* Join scheduled live classes.
* Access notes and PDF documents.
* Download permitted PDFs for offline reading and printing.
* View notices and assignments.
* Track learning progress.
* Receive push notifications.
* Manage their profile and device session.

## 3.2 Apple Application

The iOS application must provide equivalent core learning functionality on supported iPhones and iPads.

Requirements:

* Consistent account and course data with Android and web.
* Platform-appropriate navigation and interface.
* Secure authentication.
* Recorded and live video access.
* PDF access and permitted downloads.
* Progress synchronization.
* Push notifications where supported and authorized.
* Compatibility testing on supported iOS versions.

App Store policies and any applicable payment rules must be reviewed before release.

## 3.3 Windows and Web Access

A separate Windows desktop executable is not required for the initial release.

Students will use a responsive web application through supported browsers, including Chrome and Edge.

Requirements:

* Responsive layouts for desktop, laptop, tablet and mobile browser sizes.
* Student login and profile.
* Course browsing and enrollment access.
* Dedicated course classroom.
* Recorded and live lectures.
* PDF viewing and downloads.
* Notices, assignments and progress.
* Access control equivalent to the mobile applications.

The website must not expose course data or protected application functions merely because a user knows a URL.

## 3.4 Shared Account and Synchronization

A student's identity and learning data must be maintained centrally.

The following data should synchronize across platforms:

* Student profile.
* Course enrollments.
* Course and lecture metadata.
* Lecture completion status.
* Learning progress.
* Notices and assignments.
* Course access status.
* Relevant notification records.

Progress updates should be saved reliably and should not depend solely on local device storage.

### Device-policy clarification

The client requested one active device per student. The intended policy is:

**One student account may have only one active authenticated device session at a time across Android, iOS and web.**

If the student switches devices, the previous session must be revoked according to the configured policy.

The student must be able to use the same account on all supported platforms, but not necessarily simultaneously. An administrator-controlled device reset process must be available.

If the client later requires simultaneous access on multiple devices, the policy must be revised explicitly.

---

# 4. User Roles and Permissions

## 4.1 Student

Students may:

* Access their own profile.
* View available courses.
* Access only courses for which they have valid enrollment or demo access.
* Watch authorized lectures.
* Join authorized live classes.
* View and download permitted PDFs.
* View notices and assignments.
* Submit assignments where enabled.
* View their own progress.
* View relevant notifications.
* Request device reset or support.

Students must not be able to:

* Modify their course price or enrollment status.
* Access another student's personal information.
* Change payment or coupon records.
* Modify course content.
* Access administrative interfaces.
* Bypass server-side authorization by changing browser requests.

## 4.2 Administrator

Initially, one administrator will manage the platform.

The administrator may:

* Manage students and their profiles.
* Import existing students.
* Create and edit courses.
* Manage subjects and chapters.
* Add and organize lectures.
* Schedule live classes.
* Manage demo access.
* Manage notes and PDF metadata.
* Publish notices and assignments.
* Manage coupon definitions where enabled.
* Review enrollment and payment records.
* Manage device sessions.
* Send notifications.
* View reports.
* Configure supported application settings.

Administrative actions must be protected by role-based authorization and recorded in audit logs where appropriate.

## 4.3 Teacher Role

A separate teacher role is not confirmed for the initial release.

The architecture should allow teacher accounts and restricted permissions to be introduced later without redesigning the entire application.

Teacher permissions must not be enabled by default until approved.

---

# 5. Authentication and Student Profiles

## 5.1 Phone OTP Authentication

The primary login method is phone-number OTP authentication.

Required functionality:

* Enter phone number.
* Request OTP.
* Verify OTP.
* Create or retrieve the student account.
* Maintain an authenticated session.
* Log out.
* Handle expired or incorrect OTPs.
* Handle resend cooldowns and rate limits.
* Display understandable error messages.

OTP authentication must use Firebase Authentication or an approved equivalent integration.

SMS availability, quotas, provider policies and charges must be checked before production deployment.

## 5.2 Student Profile

Required profile fields:

* Full name.
* Phone number.
* Class or academic level.
* Student identifier, generated by the system.
* Account creation date.
* Account status.
* Enrolled courses.
* Current device-session status.

Optional future fields include board, school, guardian contact and academic year. These must be added only when the client approves them.

## 5.3 Existing Student Import

The administrator must be able to register existing students through a controlled import workflow.

Requirements:

* CSV import initially.
* Column validation.
* Duplicate detection.
* Preview before import.
* Row-level success and error reporting.
* Safe handling of invalid phone numbers.
* No accidental overwriting of existing student records.

Imported students must not automatically bypass phone verification or receive unauthorized course access.

---

# 6. Home Dashboard

The student home screen should provide clear access to learning activities.

Required sections:

* Welcome message.
* My Learning.
* Enrolled courses.
* Continue Learning.
* Upcoming live classes.
* Recent or featured lectures.
* Important notices.
* Available demo classes.
* Notifications.
* Profile access.

The dashboard should be data-driven. Course and lecture cards must be generated from backend data rather than hardcoded lists.

Empty states should explain what the student can do next when they have no enrolled courses or upcoming classes.

---

# 7. Course Catalogue and Store

## 7.1 Course Categories

The platform must support educational content for:

* Class 10.
* Class 12.
* Commerce students.
* WBBSE.
* WBCHSE.

The administrator must be able to configure additional classes, subjects and academic categories in the future.

## 7.2 Course Types

The system must support:

1. Full courses.
2. Single-subject courses.
3. Free courses.
4. Demo courses or demo lectures.

Each course should support:

* Course title.
* Description.
* Thumbnail.
* Class and academic category.
* Subject list.
* Chapters.
* Teacher/instructor display name, if applicable.
* Course duration or validity, if applicable.
* Price metadata, if applicable.
* Publication status.
* Enrollment requirements.

## 7.3 Course Details

The course details screen should display:

* Course title and description.
* Subjects and chapters.
* Available lectures.
* Demo content, where configured.
* Course validity and access conditions.
* Price or free-access status.
* Enrollment status.
* A clear action to view or access the course.

A course must not become accessible merely because its details page is public.

## 7.4 Enrollment

Course access must be controlled by a backend enrollment record.

Supported enrollment sources should include:

* Administrator-created enrollment.
* Approved student import and enrollment workflow.
* Free-course enrollment.
* Demo access.
* Future verified online purchase.

Each enrollment should contain the student, course or subject, status, creation time and applicable access period.

Revoked or expired enrollments must no longer grant access to protected course content.

---

# 8. Dedicated Course Classroom

When a student opens a course from My Learning, the application must display a separate classroom experience.

The classroom should have its own navigation and course-focused layout rather than simply reusing the main application navigation.

## 8.1 Classroom Sections

* Classroom Overview.
* Subjects.
* Chapters.
* Recorded Lectures.
* Live Classes.
* Notes and PDFs.
* Notice Board.
* Assignments.
* Learning Progress.
* Course Details.

Only sections with relevant published content should display useful data. If a section is empty, show a clear empty state rather than a broken page.

## 8.2 Classroom Overview

Display:

* Course name.
* Overall progress.
* Continue Learning.
* Recent lectures.
* Upcoming live classes.
* Recent notices.
* Available assignments.
* Important course information.

The layout must remain usable on small phones and large Windows screens.

---

# 9. Recorded Video Lectures

## 9.1 Video Provider

YouTube is the initial recorded-video provider.

The client has identified the following channel:

https://www.youtube.com/@wbartsbyvikassir

The administrator should be able to add video metadata through the admin panel.

Each lecture should support:

* Lecture title.
* Description.
* Course.
* Subject.
* Chapter.
* YouTube video identifier or approved video URL.
* Display order.
* Publication status.
* Optional duration metadata.
* Optional notes/PDF attachment.
* Free, demo or enrolled-course access classification.

## 9.2 Playback

Required playback features:

* Play and pause.
* Resume where supported by the selected player.
* Previous and next lecture navigation.
* Playback progress tracking.
* Lecture completion status.
* Playback-speed controls where supported.
* Clear loading, buffering and error states.
* Network-error recovery guidance.

### Video quality

The client requested 480p and 720p options.

Actual quality selection depends on the YouTube player, source video and available streams. The application must provide quality selection only where the embedded player supports it. It must not promise that both resolutions will always be available.

## 9.3 Progress Tracking

Progress should be stored per student and lecture.

Recommended fields:

* Student ID.
* Course ID.
* Lecture ID.
* Last known position, where available.
* Completion status.
* Last updated timestamp.

Progress must be validated to prevent arbitrary client requests from modifying another student's records.

The exact lecture-completion threshold should be configurable or finalized during implementation.

## 9.4 YouTube Limitations

Unlisted YouTube videos are not equivalent to DRM-protected videos. A person with access to an unlisted video may be able to share its URL.

The platform must not claim that an embedded YouTube player provides absolute protection against downloading, copying or external recording.

If stronger content protection is required later, evaluate a dedicated video-hosting service with access controls and suitable DRM capabilities.

---

# 10. Live Classes

YouTube Live is the initial live-class platform.

The administrator must be able to:

* Create a live-class entry.
* Enter the class title and description.
* Associate it with a course or subject.
* Set the scheduled date and time.
* Add the approved YouTube Live URL or video identifier.
* Publish or unpublish the class.
* Cancel or update a scheduled class.
* Send a notification when appropriate.

Students must see:

* Upcoming classes.
* Scheduled time.
* Relevant course or subject.
* Join action when the class is available.
* Recording or replay link when one is supplied.

The client has indicated that live classes do not need to be recorded for later viewing initially.

Therefore, automatic recording and replay management are not mandatory for the initial release.

The application must not assume that every YouTube Live session will produce a recording.

Live video access is subject to YouTube availability, account eligibility and applicable platform policies.

---

# 11. Notes and PDF Documents

Google Drive is the planned document-storage provider.

## 11.1 PDF Management

The administrator should be able to associate PDFs with:

* A course.
* A subject.
* A chapter.
* A lecture.
* An optional notice or assignment.

Each PDF record should include:

* Document title.
* Description.
* Google Drive file identifier.
* Related course or subject.
* Publication status.
* Download permission.
* Display order.
* Creation and update timestamps.

## 11.2 Student PDF Features

Students must be able to:

* View authorized PDF notes.
* Download PDFs when permitted.
* Open downloaded files through supported device applications.
* Print downloaded PDFs using available device or browser functionality.

Downloaded files may remain on a device after access is revoked. The application must not promise remote deletion of previously downloaded copies.

## 11.3 Google Drive Access

* Avoid making the entire Drive folder publicly accessible.
* Do not expose Google credentials or private API credentials in the frontend.
* Store file identifiers and metadata in the database.
* Check student authorization before issuing a protected download or viewing link.
* Use an appropriately authorized backend integration.
* Handle expired permissions, missing files and quota errors.

Google Drive API quotas, sharing behaviour and download limits must be tested before production.

---

# 12. Notice Board

The notice board is required.

The administrator should be able to create, edit, publish and archive notices.

Notice categories may include:

* General announcement.
* Class update.
* Exam information.
* Schedule change.
* Holiday notice.
* Course-specific announcement.

Each notice should support:

* Title.
* Content.
* Publication time.
* Optional attachment.
* Optional course targeting.
* Publication status.

Students should see only notices intended for them or their enrolled courses.

Important notices may also trigger push notifications.

---

# 13. Assignments and Homework

The assignment system is required.

## 13.1 Administrator Functions

* Create an assignment.
* Add title and instructions.
* Associate the assignment with a course, subject or chapter.
* Set a due date where applicable.
* Attach supporting material.
* Publish, edit or archive an assignment.
* Review submissions.
* Record feedback and marks where enabled.

## 13.2 Student Functions

* View available assignments.
* Read instructions.
* View deadlines.
* Submit supported files if submission is enabled.
* See submission status.
* View teacher/admin feedback and marks when available.

Supported submission formats and file-size limits must be finalized before implementation.

Assignments and submissions must be accessible only to authorized users.

---

# 14. Learning Progress

The platform should provide a simple and reliable learning-progress system.

Required functionality:

* Track lecture completion.
* Show course progress.
* Show subject or chapter progress where practical.
* Identify the next recommended lecture.
* Allow the student to continue learning.
* Show assignment status.
* Provide basic administrator visibility into student progress.

Progress calculations must be documented and consistent across mobile and web.

The system must distinguish between a lecture that was opened, a lecture with saved playback progress and a lecture considered complete.

---

# 15. Notifications

Push notifications are required.

Notification categories may include:

* New lecture.
* New live class.
* Live class reminder.
* New notice.
* New assignment.
* Course update.
* Account or device-session notification.

Requirements:

* Request notification permission where required.
* Store and manage device notification tokens securely.
* Allow the backend to send notifications to intended recipients.
* Support relevant course or student targeting.
* Handle invalid or expired tokens.
* Avoid sending duplicate notifications unnecessarily.
* Provide an in-app notification list where practical.

Notification delivery cannot be guaranteed when a device is offline, permissions are disabled or the platform restricts background delivery.

---

# 16. Coupon and Discount System

The client has requested a coupon/discount feature.

However, online payments are currently marked as not required. Therefore, the initial implementation must separate coupon management from a future paid-checkout workflow.

## 16.1 Initial Scope

The administrator may create coupon definitions containing:

* Coupon code.
* Description.
* Discount type.
* Discount value.
* Start and expiry dates.
* Applicable course or subject.
* Active/inactive status.
* Usage limit, if required.

The system must validate coupon definitions and prevent invalid discounts.

## 16.2 Payment Dependency

A coupon has no automatic monetary effect without a checkout or enrollment workflow that applies it.

For the initial release:

* Coupon management may be prepared in the admin panel.
* Free/demo enrollment must work independently.
* Paid checkout and payment-based automatic enrollment remain disabled until the client approves the payment scope.
* Any manual discount or free-enrollment workflow must be explicitly defined.

---

# 17. Payments and Orders

## 17.1 Current Scope

The client selected **No** for online payments and does not currently have a Razorpay account.

Consequently:

* Razorpay integration is not a confirmed initial-release requirement.
* The system must not present a working online-payment flow without an approved provider and configuration.
* Course access must not depend on a payment workflow that has not been implemented.
* Administrators must be able to manage enrollments independently of online payment.

## 17.2 Future Readiness

The architecture should allow future integration of:

* Razorpay or another approved payment provider.
* Payment order creation.
* Server-side payment verification.
* Successful and failed payment records.
* Refund status.
* Payment receipts.
* Coupon application.
* Verified automatic course enrollment.

When payments are introduced, the backend must verify payment status independently. A frontend success screen must never be sufficient to grant paid-course access.

The client must approve the payment workflow before this feature is included in a delivery commitment.

---

# 18. One-Device Security

The client requires one active device per student.

## 18.1 Requirements

* Register an authenticated device session.
* Associate the session with the student account.
* Enforce the active-session policy on the backend.
* Revoke the previous session when an approved device switch occurs.
* Allow the administrator to inspect relevant session metadata.
* Allow an authorized administrator to reset a student's device.
* Record significant session and reset events.
* Handle expired and revoked sessions.
* Avoid exposing sensitive device information unnecessarily.

## 18.2 Technical Design

Use a server-managed session or device record with a unique session identifier, status and timestamps.

Session creation, switching and revocation must be handled through trusted backend logic using atomic operations or transactions where appropriate.

The system must handle two devices attempting to activate simultaneously without accidentally leaving both sessions authorized.

Every protected content request must enforce the applicable authorization policy. Merely hiding a screen or removing a navigation link is not sufficient.

## 18.3 Cross-Platform Behaviour

A student may sign in through Android, iOS or web. Activating a new device may revoke the previous device session regardless of platform.

The user experience should explain that the previous session was replaced and provide a clear recovery path.

Administrators must be able to resolve legitimate device-change problems.

---

# 19. Screenshot, Screen Recording and Content Protection

The client has requested restrictions on screenshots and screen recording.

## 19.1 Security Measures

Implement appropriate protections where technically supported, such as:

* Native screenshot or screen-capture restrictions on supported mobile platforms.
* Protected application screens where appropriate.
* Student-identifying watermarks where feasible.
* Enrollment-based content authorization.
* Controlled document access.
* Server-side device-session enforcement.
* Firebase App Check where supported.
* Secure handling of credentials and API access.

## 19.2 Limitations

Absolute screenshot and screen-recording prevention cannot be guaranteed across all platforms.

Restrictions may vary between Android, iOS and web browsers. A separate external camera can also record a screen.

YouTube Unlisted links can be shared, and previously downloaded PDFs may remain available outside the application.

The product must describe these safeguards accurately and must not claim complete piracy prevention.

---

# 20. Admin Panel

The admin panel will be a responsive web application.

## 20.1 Dashboard

Display useful operational summaries, such as:

* Total students.
* Active students.
* Published courses.
* Enrollments.
* Upcoming live classes.
* Published lectures.
* Assignments.
* Recent notices.
* Device-session activity.
* Payment or order information only when applicable.

All dashboard metrics must be calculated from real backend data.

Do not display fabricated revenue, student counts or analytics.

## 20.2 Student Management

* Student list.
* Search and filters.
* Student details.
* Create or update student records.
* CSV import.
* Enrollment management.
* Account status.
* Relevant progress summary.
* Device-session inspection.
* Device reset.
* Access revocation where authorized.

## 20.3 Course Management

* Create and edit courses.
* Manage course descriptions and images.
* Configure academic category.
* Manage subjects and chapters.
* Configure course visibility.
* Manage demo access.
* Manage course access and enrollments.

## 20.4 Lecture Management

* Create lecture entries.
* Add YouTube video references.
* Associate lectures with courses and chapters.
* Reorder lectures.
* Publish and unpublish lectures.
* Add optional descriptions and notes references.
* Manage live-class entries.

## 20.5 PDF Management

* Create and edit PDF records.
* Associate documents with course content.
* Store Google Drive file identifiers.
* Configure download permissions.
* Publish and unpublish documents.
* Handle missing or inaccessible files.

## 20.6 Notice and Assignment Management

* Create and publish notices.
* Target relevant courses.
* Create and update assignments.
* Review student submissions where enabled.
* Record feedback and marks where enabled.
* Archive outdated material.

## 20.7 Coupon and Payment Administration

* Manage coupon definitions.
* View enrollment records.
* View payment/order records when a payment provider is enabled.
* Show the actual status of each record.
* Prevent unauthorized edits to verified payment records.

## 20.8 Notification Management

* Compose notifications.
* Select eligible recipients or courses.
* Preview the notification.
* Send or schedule it where supported.
* View delivery-related status where available.

## 20.9 Audit Logs

Record important administrative actions, including:

* Course publication changes.
* Enrollment creation or revocation.
* Student account blocking.
* Device-session reset.
* Notice publication.
* Assignment changes.
* Coupon changes.
* Administrative permission changes.

Logs should avoid storing passwords, OTPs, access tokens or unnecessary personal data.

---

# 21. Technical Architecture

## 21.1 Proposed Stack

| Component          | Proposed Technology                                                               |
| ------------------ | --------------------------------------------------------------------------------- |
| Android App        | React Native + Expo + TypeScript                                                  |
| iOS App            | React Native + Expo + TypeScript                                                  |
| Student Web        | Next.js + TypeScript                                                              |
| Admin Panel        | Next.js + TypeScript                                                              |
| Styling            | Tailwind CSS for web; shared design tokens and suitable native styling for mobile |
| Authentication     | Firebase Authentication                                                           |
| Database           | Cloud Firestore                                                                   |
| Trusted Backend    | Firebase Cloud Functions + TypeScript                                             |
| Backend Protection | Firestore Security Rules, App Check and server-side authorization                 |
| Push Notifications | Firebase Cloud Messaging                                                          |
| Recorded Videos    | YouTube                                                                           |
| Live Classes       | YouTube Live                                                                      |
| PDF Storage        | Google Drive API                                                                  |
| Source Control     | Git and GitHub                                                                    |
| Validation         | Shared schemas and server-side validation                                         |
| Testing            | Unit, integration, security-rule and end-to-end tests                             |

Versions must be selected and pinned according to current compatibility, security and platform-support requirements at implementation time.

## 21.2 Application Separation

The student mobile application, student web application and admin panel must have separate application entry points and deployment configurations.

Shared business types and validation schemas may be placed in shared packages.

Platform-specific UI, routing, video integration and native functionality should remain separated where needed.

The system must not force every interface into a single universal component if that makes accessibility, usability or maintainability worse.

## 21.3 Backend Responsibilities

Trusted backend functions should handle operations requiring authorization or consistency, including:

* Device-session activation and revocation.
* Administrative enrollment changes.
* Privileged account operations.
* Protected document-link issuance where needed.
* Notification dispatch.
* Future payment verification.
* Sensitive audit logging.

Administrative credentials and privileged server SDKs must never be bundled into a client application.

---

# 22. Database Design

The initial database should be organized around well-defined entities.

| Collection      | Purpose                              |
| --------------- | ------------------------------------ |
| users           | Core account and profile data        |
| admins          | Administrative roles and permissions |
| teachers        | Future teacher accounts              |
| courses         | Course metadata                      |
| subjects        | Subject metadata                     |
| chapters        | Chapter organization                 |
| lectures        | Recorded lecture metadata            |
| liveClasses     | Live-class schedules and links       |
| demoClasses     | Demo access definitions              |
| enrollments     | Student course/subject access        |
| lectureProgress | Student lecture progress             |
| pdfs            | PDF metadata and Drive references    |
| notices         | Published announcements              |
| assignments     | Assignment definitions               |
| submissions     | Student assignment submissions       |
| coupons         | Coupon definitions                   |
| orders          | Future purchase orders               |
| payments        | Future verified payment records      |
| devices         | Active device/session records        |
| notifications   | Notification records                 |
| supportTickets  | Optional future support workflow     |
| auditLogs       | Important administrative activity    |
| settings        | Approved application configuration   |

## 22.1 Data Modelling Rules

* Use stable document identifiers.
* Define required fields and validation rules.
* Store timestamps consistently.
* Avoid copying large documents unnecessarily.
* Avoid unbounded arrays for growing student activity.
* Design indexes around real queries.
* Use transactions or batched writes when required.
* Document data ownership and deletion rules.
* Apply appropriate access control to every collection.
* Avoid exposing private fields in public course documents.

The final schema must be documented in the architecture specification before extensive implementation begins.

---

# 23. Security and Privacy Requirements

Security must be designed into the application rather than added only at the end.

Requirements:

* Firebase Authentication for supported user sessions.
* Firestore Security Rules for client-side data access.
* Server-side authorization for privileged operations.
* Firebase App Check where supported.
* Least-privilege administrative access.
* Input validation on client and server.
* Rate limiting for sensitive operations.
* Protection against unauthorized enrollment changes.
* Secure handling of YouTube and Drive metadata.
* No secrets committed to GitHub.
* No private service-account credentials in browser or mobile bundles.
* No passwords or OTPs stored in application logs.
* Restricted access to student personal data.
* Appropriate error handling without leaking internal details.
* Documented backup and recovery procedures.

Security rules must be tested using Firebase Emulator Suite or an equivalent controlled testing environment before production release.

App Check supplements authentication and authorization; it does not replace them.

---

# 24. File Structure and Maintainability

The repository must use a modular, feature-based structure.

Proposed high-level structure:

```
bikash-bhaiya-classes/
├── apps/
│   ├── mobile/
│   │   └── src/
│   │       ├── app/
│   │       ├── features/
│   │       ├── components/
│   │       ├── services/
│   │       ├── hooks/
│   │       └── utils/
│   ├── web/
│   │   └── src/
│   │       ├── app/
│   │       ├── features/
│   │       ├── components/
│   │       ├── services/
│   │       └── utils/
│   └── admin/
│       └── src/
│           ├── app/
│           ├── features/
│           ├── components/
│           └── services/
├── packages/
│   ├── shared-types/
│   ├── shared-schemas/
│   └── shared-utils/
├── functions/
│   └── src/
├── firebase/
├── docs/
├── tests/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 24.1 File Responsibility Rules

* Keep files focused on one primary responsibility.
* Separate UI, business logic, data access and validation.
* Extract reusable components when genuine reuse exists.
* Avoid oversized components, service files and database modules.
* Avoid unnecessary abstraction and excessive fragmentation.
* Prefer clear names and explicit types.
* Keep feature-specific code together.
* Centralize shared types and schemas where appropriate.
* Avoid circular dependencies.
* Do not duplicate authorization rules inconsistently across applications.
* Keep platform-specific implementation details isolated.

A typical target is approximately 100–200 lines per file where practical. Files approaching 250–300 lines should be reviewed for possible decomposition; these are guidelines, not absolute limits.

---

# 25. UI/UX Design Requirements

## 25.1 Visual Identity

* Primary theme: Blue.
* Design direction: Clean, simple, modern and educational.
* Brand: Bikash Bhaiya Classes.
* Tagline: Rato nahi... Samjho...
* Use readable typography.
* Use consistent spacing and icons.
* Keep course and lecture information easy to scan.
* Avoid excessive animation or unnecessary decoration.

## 25.2 Responsive Design

The web interface must support:

* Small mobile screens.
* Tablets.
* Laptop screens.
* Large desktop displays.

The mobile app must use native-appropriate navigation and layouts.

## 25.3 Accessibility

* Readable text sizes.
* Adequate contrast.
* Clearly labelled controls.
* Accessible focus behaviour on web.
* Appropriate touch-target sizes.
* Loading, empty, success and error states.
* Clear confirmation for destructive administrative actions.

## 25.4 Design Consistency

Use shared design tokens for:

* Colours.
* Typography.
* Spacing.
* Border radii.
* Elevation.
* Status colours.
* Component variants.

The exact component library and design tokens should be finalized in DESIGN.md.

---

# 26. Performance and Reliability

The platform should remain usable on common student devices and ordinary mobile internet connections.

Requirements:

* Paginate large lists.
* Load course content on demand.
* Avoid downloading unnecessary media or documents.
* Use appropriate image sizes.
* Avoid unnecessary database reads.
* Handle slow connections and interrupted requests.
* Show clear video buffering states.
* Prevent duplicate submissions where possible.
* Avoid losing saved learning progress.
* Use error boundaries or equivalent recovery patterns.
* Keep expensive work out of frequently rendered UI components.
* Monitor production errors through an approved monitoring solution.

Video buffering depends on network quality, YouTube delivery, source encoding and the user's device. The application must optimize its own performance without promising uninterrupted playback under all network conditions.

---

# 27. Testing Requirements

## 27.1 Unit Tests

Test critical business logic such as:

* Enrollment eligibility.
* Coupon validation.
* Lecture-progress calculations.
* Role and permission checks.
* Device-session state transitions.
* Input validation.

## 27.2 Integration Tests

Test:

* Authentication and profile creation.
* Course retrieval.
* Enrollment creation and revocation.
* Lecture access.
* Protected PDF access.
* Assignment submission.
* Notification workflows.
* Device switching.
* Administrative actions.

## 27.3 Security Tests

Verify that:

* Unauthenticated users cannot access protected data.
* Students cannot access other students' private records.
* Students cannot change their own enrollment privileges.
* Students cannot access unpublished protected course content.
* Unauthorized administrators cannot perform privileged actions.
* Revoked device sessions lose protected access.
* Private service credentials never reach client bundles.

## 27.4 Cross-Platform Tests

Test core user journeys on:

* Android.
* iPhone/iPad.
* Windows Chrome.
* Windows Edge.
* Supported mobile browsers.

Also test:

* OTP failure.
* Weak or disconnected internet.
* Video playback errors.
* Missing PDF files.
* Expired sessions.
* Device switching.
* Empty course states.
* Invalid links.
* App restart and progress synchronization.

---

# 28. Deployment and Operations

## 28.1 Firebase Setup

The client does not currently have a Firebase project.

Deployment planning must include:

* Firebase project creation.
* Correct environment configuration.
* Authentication provider setup.
* Firestore database creation.
* Security rules.
* Required indexes.
* Cloud Functions deployment.
* App Check configuration.
* Push-notification setup.
* Billing and quota review.
* Backup and recovery planning.

The production region should be chosen deliberately based on availability, data residency needs and supported services.

## 28.2 Android Release

Requirements:

* Production application identifier.
* Release signing configuration.
* Tested release build.
* Privacy disclosures.
* Required Play Console configuration.
* Store listing and assets.
* Release testing and review.

## 28.3 iOS Release

Requirements:

* Production bundle identifier.
* Apple signing and provisioning.
* Supported iOS build.
* App Store Connect configuration.
* Privacy disclosures.
* Store listing and assets.
* TestFlight testing and App Review.

Apple Developer membership and other applicable account charges are separate third-party matters.

## 28.4 Web Deployment

Requirements:

* Production domain and HTTPS.
* Environment-specific configuration.
* Secure authentication configuration.
* Production build validation.
* Error monitoring.
* Rollback plan.
* Appropriate caching and security headers.

The deployment provider must be selected after evaluating the requirements and budget.

---

# 29. Third-Party Services and Costs

The project may depend on:

* Firebase.
* SMS/OTP delivery.
* Google Drive API.
* YouTube and YouTube Live.
* Domain registration.
* Web hosting.
* Google Play Console.
* Apple Developer Program.
* Future payment provider.
* Optional monitoring services.

Before production launch, DevSamp and the client must identify which services are free, usage-based or subscription-based.

Third-party pricing and policies can change. The system must not rely on an assumption that every service will remain free.

No paid service should be activated without appropriate client approval and account ownership arrangements.

Passwords, OTPs, private keys and service-account credentials must never be collected through the project requirements form.

---

# 30. Scope Boundaries

## 30.1 Confirmed Initial Features

* Android student app.
* iOS student app.
* Responsive student web application.
* Admin web panel.
* Phone OTP authentication.
* Student profiles.
* Course catalogue.
* Full-course and single-subject structure.
* Free/demo access.
* Dedicated classroom.
* YouTube recorded lectures.
* YouTube Live class scheduling and access.
* Google Drive PDF integration.
* PDF download and printing.
* Notice board.
* Assignments/homework.
* Learning progress.
* Push notifications.
* Coupon definitions and management, subject to final workflow.
* One-active-device policy.
* Student/course administration.
* Device-session management.
* Basic operational reports.
* Appropriate security and testing.

## 30.2 Not Confirmed for Initial Release

These items must not be treated as guaranteed deliverables without explicit approval:

* Razorpay or other online-payment integration.
* Automatic paid-course enrollment.
* Automatic recording of live classes.
* Secure DRM video streaming.
* Guaranteed prevention of all screenshots or recordings.
* Offline video downloads.
* Advanced analytics.
* Multi-teacher workflows.
* Complex examination or quiz engine.
* Automated AI tutoring.
* Advanced attendance tracking.
* Desktop executable for Windows.
* Guaranteed delivery or approval by external app stores.

Future features should be added through approved scope changes and a revised implementation plan.

---

# 31. Acceptance Criteria

The initial release will be considered functionally ready for acceptance when the following agreed criteria have been tested.

### Authentication

* A student can authenticate using the configured phone OTP flow.
* Invalid or expired OTPs are handled appropriately.
* Student profiles are associated with the correct account.

### Course Access

* The administrator can create a course and organize subjects and chapters.
* The administrator can enroll a student.
* A student can view authorized courses.
* Unauthorized course access is rejected by the backend.

### Cross-Platform Experience

* The same account can access its authorized courses on Android, iOS and Windows web.
* Course and lecture data remain consistent across supported platforms.
* The active-device policy is enforced according to the approved rules.

### Classroom

* Opening a course displays its dedicated classroom.
* Published lectures, live classes, notes, notices and assignments display correctly when configured.
* Empty sections show appropriate messages.

### Videos and PDFs

* Authorized recorded lectures can be opened.
* Live-class links are displayed at the configured time/status.
* Authorized PDFs can be viewed or downloaded according to their permissions.
* Errors caused by unavailable external content are handled clearly.

### Administration

* The administrator can manage students, courses, lectures and learning content.
* Device sessions can be inspected and reset by authorized administrators.
* Important administrative changes are recorded where required.

### Security and Quality

* Critical security tests pass.
* No known critical authorization bypass remains unresolved.
* Core user journeys pass on the supported platforms.
* Production configuration contains no exposed private credentials.
* Deployment and recovery instructions are documented.

Acceptance is based on tested behaviour, not merely on the existence of UI screens or buttons.

---

# 32. Dependencies and Open Decisions

The following decisions must be completed before the relevant features are finalized.

1. Confirm the exact course, subject and chapter list.
2. Collect the final logo and approved visual assets.
3. Confirm whether students will be manually enrolled or imported with existing course assignments.
4. Finalize the device-switch and administrator-reset policy.
5. Confirm whether coupon management is required before online payments are introduced.
6. Confirm whether a teacher role is required in the initial release.
7. Confirm assignment submission formats and file-size limits.
8. Confirm the PDF download-link authorization approach for Google Drive.
9. Confirm video quality behaviour based on the actual YouTube content and player.
10. Create the Firebase project and configure its production settings.
11. Confirm account ownership for YouTube, Google Drive, Firebase and app-store accounts.
12. Confirm hosting, domain and third-party service budget.
13. Confirm support, maintenance and post-launch bug-fix arrangements.
14. Confirm applicable privacy policy, terms and content rights.

Unresolved decisions must be documented rather than silently guessed.

---

# 33. Development Phases

## Phase 1 — Foundation

* Repository and workspace setup.
* TypeScript configuration.
* Environment configuration.
* Shared types and validation schemas.
* Firebase setup.
* Authentication.
* Security rules.
* Base design system.
* Documentation.

## Phase 2 — Core Learning

* Student profiles.
* Course catalogue.
* Subjects and chapters.
* Enrollment.
* My Learning.
* Dedicated classroom.
* Recorded lectures.
* Lecture progress.
* PDF access.

## Phase 3 — Administration

* Admin authentication and permissions.
* Student management.
* CSV import.
* Course management.
* Lecture management.
* PDF management.
* Notice board.
* Assignments.
* Live-class scheduling.

## Phase 4 — Security and Engagement

* One-device session enforcement.
* Device reset workflow.
* Push notifications.
* Coupon management.
* Security audit logs.
* Access-control testing.

## Phase 5 — Cross-Platform Validation

* Android testing.
* iOS testing.
* Windows browser testing.
* Responsive design checks.
* Weak-network testing.
* Security-rule testing.
* Performance checks.

## Phase 6 — Release Preparation

* Production configuration.
* Deployment.
* Store submission preparation.
* Privacy and policy checks.
* Client acceptance testing.
* Documentation and handover.

The phases may overlap where appropriate, but critical security and authorization requirements must not be postponed until after production release.

---

# 34. Engineering Rules for AI Coding Agents

Any AI coding agent working on this project must follow these rules:

1. Read PRD.md, ARCHITECTURE.md, RULES.md, DESIGN.md, TASK.md and MEMORY.md before making substantial changes, whenever these files exist.
2. Do not invent client requirements.
3. Do not silently expand project scope.
4. Do not replace working architecture without a documented reason.
5. Keep modules small, focused and readable.
6. Use TypeScript types rather than unnecessary `any`.
7. Validate all untrusted inputs.
8. Enforce authorization on the backend.
9. Never place private service credentials in client code.
10. Do not expose Firebase Admin SDK functionality to the browser or mobile application.
11. Avoid duplicating business logic across platforms.
12. Use shared types and validation schemas where appropriate.
13. Write tests for important business rules and security-sensitive changes.
14. Never disable security rules merely to make a feature work.
15. Do not use fake production data or claim that an unimplemented feature works.
16. Handle loading, empty, success and error states.
17. Update documentation when architecture, database schema or security behaviour changes.
18. Run relevant tests and builds after significant changes.
19. Record known limitations and unresolved decisions.
20. Implement one coherent task at a time and preserve working functionality.

---

# 35. Official Technical References

Use current official documentation when implementing or upgrading the technology stack.

* Expo Documentation: https://docs.expo.dev/
* Expo Router: https://docs.expo.dev/router/introduction/
* Expo Web: https://docs.expo.dev/workflow/web/
* Next.js Documentation: https://nextjs.org/docs
* Firebase Documentation: https://firebase.google.com/docs
* Firestore Security: https://firebase.google.com/docs/firestore/security/overview
* Firebase App Check: https://firebase.google.com/docs/app-check
* Google Drive API: https://developers.google.com/drive/api/guides/about-sdk
* YouTube Data API: https://developers.google.com/youtube/v3
* YouTube IFrame Player API: https://developers.google.com/youtube/iframe_api_reference
* Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging

Use these references to verify current platform capabilities, security requirements and compatibility before implementation.

---

# 36. Final Product Definition

Bikash Bhaiya Classes will be a cross-platform learning system consisting of:

* Android student application.
* iOS student application.
* Windows-compatible student web application.
* Administrative web panel.
* Firebase-backed authentication, data and security.
* YouTube recorded and live learning content.
* Google Drive-based PDF management.
* Course, subject, chapter and enrollment management.
* Notices, assignments, notifications and learning progress.
* Server-enforced one-active-device policy.
* Modular architecture designed for maintenance and future upgrades.

The primary goal is to deliver a simple, dependable and maintainable education platform aligned with the client's confirmed requirements, while keeping unapproved features and third-party dependencies clearly separated from the initial scope.

**Document End**
