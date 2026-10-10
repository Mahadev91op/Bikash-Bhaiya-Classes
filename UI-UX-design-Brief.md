# UI-UX-design-Brief.md

# Bikash Bhaiya Classes

## UI/UX Design System, Visual Direction, Screen Specifications and Developer Handoff

**Project:** Bikash Bhaiya Classes
**Client:** Bikash Chowdhury
**Development Agency:** DevSamp
**Document Type:** UI/UX Design Brief
**Status:** Implementation Specification
**Primary Platforms:** Android, iOS, Windows/Desktop Web, Mobile Web
**Mobile Framework:** React Native + Expo + TypeScript
**Student Web:** Next.js + TypeScript
**Admin Web:** Next.js + TypeScript
**Backend:** Firebase
**Primary Design Reference:** User-provided application screenshots
**Theme:** Light, modern, premium educational interface

---

# 1. Document Purpose

This document defines the visual design, interaction principles, design tokens, reusable components, responsive behavior, accessibility requirements, and screen-level specifications for Bikash Bhaiya Classes.

The goal is to build a cohesive educational platform that looks polished, works reliably, and remains easy to maintain as the application grows.

This document must be used alongside:

* `PRD.md` — product requirements.
* `TRD.md` — technical requirements.
* `ARCHITECTURE.md` — system architecture.
* `RULES.md` — engineering and security rules.
* `DESIGN.md` — detailed design-system implementation rules.
* `AppFlow.md` — navigation and user journeys.
* `TASK.md` — implementation checklist.
* `MEMORY.md` — persistent project decisions.

If a file does not exist yet, do not invent its contents. Follow the approved requirements that are available and document unresolved decisions.

## 1.1 Design Outcome

The finished product must feel like a professional, modern learning platform rather than a generic template or an AI-generated collection of unrelated screens.

The interface must be:

* Visually consistent.
* Content-first.
* Easy for school students to understand.
* Fast to navigate.
* Responsive on different screen sizes.
* Accessible to users with different needs.
* Consistent across mobile and web.
* Built from reusable components.
* Connected to real application data.
* Free from unfinished or misleading interactions.

# 2. Visual Reference Interpretation

The screenshots supplied by the client define the intended visual direction.

They are the primary reference for the following characteristics:

* Light lavender or cool off-white page backgrounds.
* White content cards.
* Blue primary buttons.
* Rounded cards and form controls.
* Clean, compact headers.
* Readable typography.
* Course cards with thumbnails and concise metadata.
* Progress bars and course statistics.
* A mobile bottom navigation bar.
* Separate classroom navigation.
* Structured profile sections.
* Coupon and checkout layouts.
* Notification cards with contextual actions.
* Course curriculum with expandable modules.

The implementation should reproduce the design language and interaction patterns, not blindly copy every pixel from a screenshot.

The example names, course prices, student details, ratings, and statistics in the screenshots are placeholders. They must not become production data.

## 2.1 Reference-to-Screen Mapping

| Reference       | Required design direction                                           |
| --------------- | ------------------------------------------------------------------- |
| Course Explorer | Search, filters, promotional banner, course cards                   |
| My Learning     | Course progress, continue learning, active module, upcoming alerts  |
| Profile         | Profile header, academic details, preferences, support              |
| Checkout        | Course summary, coupon entry, price breakdown, payment action       |
| Notifications   | Filter chips, unread indicators, grouped notification cards         |
| Home            | Welcome section, continue learning, live class, featured courses    |
| Course Details  | Course hero, instructor, curriculum, preview and enrollment actions |

## 2.2 Reference Priority

When implementing a screen, use this priority:

1. Approved project requirements.
2. This design brief.
3. The actual reference screenshot for that screen.
4. Shared design tokens and reusable components.
5. Platform-specific conventions.
6. Developer judgment for details not otherwise specified.

Do not introduce an entirely different visual style for individual screens without approval.

# 3. Brand and Design Personality

## 3.1 Brand Personality

Bikash Bhaiya Classes should communicate:

* Trust.
* Academic clarity.
* Professional teaching.
* Progress and achievement.
* Simplicity.
* Reliability.
* Modern digital learning.

The application should feel friendly to school students without appearing childish.

It should feel premium without looking like a financial dashboard or a gaming interface.

## 3.2 Visual Direction

Use a restrained blue-and-neutral palette.

The visual emphasis must come from hierarchy, spacing, typography, and well-composed cards rather than excessive gradients or decorative effects.

### Primary visual characteristics

* Light surfaces.
* Clear section headings.
* Strong primary actions.
* Consistent rounded corners.
* Subtle elevation.
* Balanced whitespace.
* Clear active and inactive states.
* High-quality educational imagery.
* Consistent icon style.
* Restrained use of semantic colors.

### Avoid

* Neon colors.
* Excessive gradients.
* Excessive glassmorphism.
* Large decorative illustrations that push content below the fold.
* Random shadows.
* Inconsistent card shapes.
* Excessive animations.
* Tiny low-contrast text.
* Unnecessary decorative badges.
* Different design systems on different pages.
* Generic placeholder dashboards in production.

# 4. Design System Architecture

The design system must be implemented as a centralized, reusable foundation.

Its primary layers are:

1. Design tokens.
2. Typography system.
3. Spacing and layout system.
4. Component library.
5. Screen templates.
6. Platform-specific adaptations.
7. Interaction and motion rules.
8. Accessibility rules.

## 4.1 Single Source of Truth

Define reusable tokens for:

* Colors.
* Typography.
* Spacing.
* Border radii.
* Elevation.
* Borders.
* Icon sizes.
* Component dimensions.
* Animation durations.
* Responsive breakpoints.
* Z-index or layering rules where relevant.

Do not hardcode slightly different versions of the same design value across unrelated files.

## 4.2 Shared Versus Platform-Specific UI

The product must share design principles and component semantics across platforms.

However, not every component must use identical implementation code.

Mobile and web may use platform-appropriate components when this improves usability or accessibility.

Examples:

* Mobile bottom tabs versus desktop sidebar.
* Native-safe-area-aware mobile headers versus desktop sticky headers.
* Mobile sheets versus desktop dialogs.
* Mobile full-screen player versus desktop player layout.

The goal is visual consistency and consistent behavior, not forcing every platform into the same layout.

# 5. Color System

## 5.1 Initial Color Tokens

Use the following values as the starting palette. Verify text contrast and interaction states before finalizing production tokens.

| Token             | Initial value | Usage                               |
| ----------------- | ------------- | ----------------------------------- |
| `primary`         | `#1554C0`     | Primary actions, active tabs, links |
| `primary-hover`   | `#1047A8`     | Hover state on web                  |
| `primary-pressed` | `#0C3988`     | Pressed state                       |
| `primary-soft`    | `#EAF0FF`     | Selected chips and subtle emphasis  |
| `background`      | `#F7F7FC`     | Main application background         |
| `surface`         | `#FFFFFF`     | Cards, dialogs, form surfaces       |
| `surface-muted`   | `#F0F2FA`     | Secondary surface                   |
| `text-primary`    | `#202435`     | Main headings and body text         |
| `text-secondary`  | `#646B7B`     | Supporting information              |
| `text-muted`      | `#7A8190`     | Low-priority metadata               |
| `border`          | `#E6E8F0`     | Card outlines and dividers          |
| `success`         | `#167747`     | Successful actions and completion   |
| `success-soft`    | `#E6F6EC`     | Success backgrounds                 |
| `warning`         | `#946200`     | Upcoming or cautionary states       |
| `warning-soft`    | `#FFF3D7`     | Warning backgrounds                 |
| `danger`          | `#B42332`     | Errors and destructive actions      |
| `danger-soft`     | `#FDEBEC`     | Error backgrounds                   |
| `info`            | `#2459A9`     | Informational states                |
| `info-soft`       | `#EAF2FF`     | Informational backgrounds           |

These are initial design tokens, not a guarantee that every foreground/background combination passes accessibility requirements.

Validate actual rendered combinations, including text on buttons, badges, images, disabled controls, and notification cards.

## 5.2 Color Usage Rules

* Blue is the primary action color.
* White is the primary card surface.
* Lavender is a subtle background color.
* Green indicates genuine success or completion.
* Amber indicates warnings or upcoming events.
* Red indicates errors or destructive actions.
* Grey indicates neutral metadata or disabled states.

Do not use semantic colors only as decoration.

Do not communicate important status through color alone. Include text, icons, or another understandable indicator.

## 5.3 Color Contrast

Target WCAG 2.2 AA contrast for applicable content:

* Normal text: at least 4.5:1.
* Large text: at least 3:1.
* Meaningful graphical controls and visual indicators: generally at least 3:1 against adjacent colors where the criterion applies.

Do not assume a color combination is accessible because it looks readable on a development monitor.

Test the final colors with a contrast checker.

# 6. Typography System

## 6.1 Font Direction

Use a clean, modern sans-serif typeface.

Preferred approach:

* Use a consistent font family with reliable support across mobile and web.
* Consider Inter for a consistent cross-platform design where its licensing and integration are appropriate.
* Use platform system fallbacks when custom font loading fails.
* Ensure correct rendering of English, Hindi, numerals, and supported regional text.

Do not mix several unrelated font families.

## 6.2 Type Scale

Use a consistent type scale.

| Token        | Suggested size | Usage                             |
| ------------ | -------------: | --------------------------------- |
| `display`    |          32 px | Rare major landing-page heading   |
| `heading-xl` |          28 px | Main page heading on wide layouts |
| `heading-lg` |          24 px | Major screen heading              |
| `heading-md` |          20 px | Important section heading         |
| `heading-sm` |          18 px | Card title or secondary heading   |
| `body-lg`    |          16 px | Main readable body text           |
| `body-md`    |          14 px | Standard supporting text          |
| `body-sm`    |          12 px | Compact metadata                  |
| `label`      |          13 px | Labels and compact controls       |
| `button`     |       14–16 px | Primary and secondary actions     |

Use platform-appropriate scalable units where applicable. The values above are design starting points, not permission to ignore user text scaling.

## 6.3 Typography Rules

* Use medium or semibold weights for headings.
* Use regular weights for body text.
* Reserve bold for emphasis and primary values.
* Avoid long paragraphs inside compact cards.
* Use consistent line heights.
* Avoid excessively tight letter spacing.
* Truncate long course titles carefully.
* Provide the full course title on the details screen.
* Do not reduce text size simply to fit a crowded design.
* Allow layouts to expand when the user increases text size.

## 6.4 Numerical Information

Use consistent formatting for:

* Prices.
* Percentages.
* Lecture counts.
* Durations.
* Dates.
* Times.
* Marks.

Display currency in Indian Rupees where applicable.

For example, use `₹2,499` rather than mixing inconsistent currency formats.

Prices and statistics must come from actual configured data.

# 7. Spacing and Layout System

## 7.1 Spacing Tokens

Use a consistent spacing scale based on multiples of four.

| Token      | Value |
| ---------- | ----: |
| `space-1`  |  4 px |
| `space-2`  |  8 px |
| `space-3`  | 12 px |
| `space-4`  | 16 px |
| `space-5`  | 20 px |
| `space-6`  | 24 px |
| `space-8`  | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |

Use these tokens consistently across screens.

## 7.2 Mobile Layout

For phone layouts:

* Use a consistent horizontal page gutter, generally 16–20 px.
* Avoid unnecessary horizontal scrolling.
* Use a single-column layout for course lists.
* Keep important actions visible and easy to reach.
* Use full-width primary actions when appropriate.
* Respect device safe areas.
* Keep the bottom navigation separate from scrollable content.
* Add bottom content padding when fixed navigation could cover the last card.
* Ensure sticky actions do not obscure forms or important text.

## 7.3 Tablet Layout

For tablets:

* Increase available content width thoughtfully.
* Use two-column course layouts where appropriate.
* Keep card text readable.
* Avoid stretching forms across the entire screen.
* Adapt classroom content to use available width efficiently.

## 7.4 Desktop Layout

For desktop web:

* Use a centered content container with a defined maximum width.
* Use a sidebar or top navigation where appropriate.
* Use multi-column layouts for course discovery.
* Keep form widths readable.
* Use whitespace to separate major content groups.
* Avoid oversized full-width cards when their content is small.
* Maintain consistent alignment between section headings, cards, and controls.

## 7.5 Responsive Breakpoints

Define breakpoints centrally.

Suggested starting points:

* Compact: below 600 px.
* Medium: 600–899 px.
* Wide: 900–1199 px.
* Extra wide: 1200 px and above.

These values must be validated against actual layouts and component behavior.

Do not scatter independent media-query values throughout the application.

# 8. Border Radius, Borders and Elevation

## 8.1 Radius Tokens

| Token         | Suggested radius | Usage                             |
| ------------- | ---------------: | --------------------------------- |
| `radius-xs`   |             4 px | Small labels and compact elements |
| `radius-sm`   |             8 px | Inputs and small controls         |
| `radius-md`   |            12 px | Standard cards                    |
| `radius-lg`   |            16 px | Major cards and dialogs           |
| `radius-xl`   |            20 px | Featured surfaces                 |
| `radius-pill` |    Fully rounded | Chips and pill buttons            |

Use a consistent radius system.

Do not assign arbitrary rounded corners to every component.

## 8.2 Borders

Prefer subtle borders when they improve separation.

Use borders for:

* Inputs.
* Secondary buttons.
* Card separation where needed.
* Tables.
* Focus and validation states.

Do not outline every nested container.

## 8.3 Shadows

Use subtle elevation for:

* Important floating controls.
* Modals.
* Dropdown menus.
* Featured promotional cards where appropriate.
* Sticky elements when visual separation is needed.

Most standard cards should rely on white surfaces and subtle borders rather than heavy shadows.

Avoid multiple large shadows stacked on nested cards.

# 9. Iconography and Imagery

## 9.1 Icon System

Use one consistent icon family across the application.

Recommended direction: a clean outline icon set such as Lucide, with consistent stroke weight and sizing.

Icons must have clear meanings.

Examples:

* Home.
* Book or Graduation Cap.
* Library.
* Bell.
* User.
* Search.
* Filter.
* Play.
* Download.
* Document.
* Calendar.
* Check.
* Lock.
* Settings.
* Help.
* Arrow Back.

Avoid mixing filled, outlined, and multicolored icons without a clear system.

## 9.2 Icon Sizes

Suggested sizes:

* Small metadata icon: 14–16 px.
* Standard action icon: 20–22 px.
* Main navigation icon: 22–24 px.
* Large empty-state illustration icon: 36–48 px.

Actual interactive targets must be larger than the visible icon.

## 9.3 Course Images

Course cards should use relevant, high-quality educational thumbnails.

Examples of appropriate subjects:

* Mathematics.
* Physics.
* Chemistry.
* Biology.
* Literature.
* Business Studies.

Use approved course imagery or licensed assets.

Do not use unrelated stock photography merely to fill empty spaces.

All thumbnails must have a consistent aspect ratio and appropriate crop behavior.

Use a fallback when an image fails to load.

## 9.4 Image Handling

* Reserve the correct image dimensions to reduce layout shifts.
* Use appropriate compression.
* Avoid downloading large images for small cards.
* Provide meaningful alternative text where images convey information.
* Use empty alternative text for purely decorative images when appropriate.
* Do not use images as a replacement for readable text.

# 10. Motion and Microinteractions

Animations must improve comprehension, feedback, or perceived continuity.

They must not delay the user's task.

## 10.1 Approved Motion Patterns

* Short button press feedback.
* Smooth tab transitions.
* Subtle card press feedback.
* Expand/collapse curriculum sections.
* Lightweight dialog transitions.
* Progress-bar updates.
* Skeleton loading transitions.
* Small navigation transitions.

## 10.2 Motion Timing

Use a restrained timing system:

* Quick interaction feedback: approximately 100–150 ms.
* Standard transitions: approximately 150–220 ms.
* Larger transitions: approximately 220–300 ms.

These are starting points, not rigid requirements for every animation.

## 10.3 Motion Rules

* Do not animate every card independently on every screen load.
* Avoid large bouncing effects.
* Avoid distracting background animations.
* Avoid unnecessary parallax.
* Respect reduced-motion preferences where supported.
* Never rely on animation alone to communicate state.
* Ensure transitions do not delay critical actions.

# 11. Component Library

All repeated UI patterns must use shared components when practical.

## 11.1 Buttons

Required variants:

* Primary.
* Secondary.
* Tertiary or text.
* Destructive.
* Icon-only.
* Loading.
* Disabled.

### Primary button

Use for the main action on a screen, such as:

* Continue Learning.
* Open Course.
* Enroll.
* Proceed to Pay.
* Save Changes.

Rules:

* One visually dominant primary action per major content region.
* Clear action label.
* Consistent height and padding.
* Visible disabled state.
* Loading state when an operation is in progress.
* Prevent accidental duplicate submission.

Do not use the primary color for every button on the same screen.

## 11.2 Search Field

Include:

* Search icon.
* Clear action when appropriate.
* Placeholder text.
* Focus state.
* Loading state where necessary.
* Empty results handling.

Search must remain usable with keyboard navigation on web.

## 11.3 Filter Chips

States:

* Default.
* Selected.
* Focused.
* Disabled.

Selected chips must be visually obvious without relying only on color.

Long chip labels must remain readable.

On mobile, allow horizontal scrolling where appropriate.

## 11.4 Cards

Use standardized card components for:

* Courses.
* Progress.
* Lectures.
* Notes.
* Assignments.
* Notifications.
* Live classes.
* Profile summaries.

Cards must share consistent padding, border radius, typography, and interaction behavior.

Avoid wrapping a clickable card around nested controls in a way that makes event handling ambiguous.

## 11.5 Badges and Status Labels

Use badges for meaningful information, such as:

* Class level.
* Free.
* Live.
* Upcoming.
* Completed.
* Locked.
* New.

Do not create decorative badges for every piece of metadata.

Badges must use readable text and accessible contrast.

## 11.6 Progress Bar

The progress component must display:

* Accurate completion value.
* A visible track.
* A fill representing the actual value.
* An accessible label or equivalent description.
* Optional textual percentage.

Handle zero progress and complete progress correctly.

Do not use a progress bar to imply completion when the data is unavailable.

## 11.7 Forms

Form components must include:

* Label.
* Input.
* Help text where needed.
* Validation state.
* Error message.
* Disabled state.
* Loading state when submitting.

Do not rely on placeholders as the only field labels.

Preserve entered values after recoverable errors.

## 11.8 Dialogs and Sheets

Use dialogs for important confirmations and focused decisions.

Use mobile-friendly sheets when they improve the experience.

Requirements:

* Clear title.
* Clear action labels.
* Safe dismissal behavior.
* Correct keyboard handling.
* Focus management on web.
* Accessible announcements where supported.

Destructive actions must not be triggered accidentally by a backdrop click.

## 11.9 Loading and Empty States

Use consistent loading skeletons that resemble the final layout.

Every major list must have a useful empty state.

Examples:

* No courses available.
* No enrolled courses.
* No notes uploaded.
* No upcoming live classes.
* No notifications.
* No assignments.

Provide a useful next action when one exists.

Do not show a blank white screen when data is missing.

# 12. Student Home Screen Design

## 12.1 Screen Objective

The Home screen must help a student answer three questions quickly:

1. What should I study next?
2. Is there an upcoming class?
3. What new learning content is available?

## 12.2 Layout

Use the following order:

1. Welcome header.
2. Student greeting.
3. Continue Learning.
4. Upcoming Live Class.
5. Featured Courses.
6. Recent Notes and Tests, if implemented.
7. Relevant notices or alerts.
8. Bottom navigation on mobile.

## 12.3 Welcome Header

Display:

* Avatar.
* Greeting.
* Student display name.
* Notification shortcut.

A streak or achievement summary may be displayed only if the underlying feature exists and the value is real.

## 12.4 Continue Learning Card

The card should emphasize:

* Course and subject.
* Current lecture.
* Progress.
* Continue action.

Use a clean white card and a strong blue primary button.

Avoid overloading the card with every available course statistic.

## 12.5 Upcoming Live Class Card

Display:

* Session title.
* Course.
* Start time.
* Upcoming or Live status.
* Join action when permitted.

Use red only for a meaningful live indicator or another necessary warning.

Do not display a Join button when the session cannot be joined.

## 12.6 Featured Courses

Use a horizontal carousel on compact screens if it remains easy to operate.

On wider layouts, use a responsive grid.

Each card must display the most useful information first.

Do not force a carousel if a simple grid is more usable for the content volume.

# 13. Courses Explorer Screen Design

## 13.1 Required Layout

Follow the supplied Course Explorer reference.

The layout must contain:

1. Compact header.
2. Explore Courses title.
3. Search field.
4. Filter chips.
5. Optional featured promotion.
6. Popular Courses heading.
7. Optional sort or category controls.
8. Course cards.
9. Bottom navigation on mobile.

## 13.2 Featured Banner

The featured banner must be configurable and data-driven.

It may display:

* A bundle offer.
* A featured course.
* A new course.
* A time-limited promotion.

Do not display a promotion if no valid offer exists.

If a promotion includes a deadline, show the correct configured deadline.

Use a strong visual hierarchy, but do not let the banner dominate the entire screen.

## 13.3 Course Card Layout

Each card should display:

* Thumbnail.
* Class/subject badge.
* Course title.
* Instructor name.
* Duration and lecture count, when available.
* Rating only if backed by genuine data.
* Price or Free status, if applicable.
* Primary action.

Keep the card visually compact without sacrificing readability.

## 13.4 Course Actions

The button must reflect the actual student state.

Examples:

* Enroll Now.
* View Details.
* Open Course.
* Start Learning.

Never show Enroll Now for a course the student already has access to unless the action has a distinct, clearly explained purpose.

# 14. Course Details Screen Design

## 14.1 Layout

Use the supplied Course Details reference as the visual baseline.

Required sections:

1. Back navigation.
2. Course hero or thumbnail.
3. Class and subject badges.
4. Course title.
5. Instructor information.
6. Course metadata.
7. Preview and enrollment actions.
8. About.
9. Learning outcomes.
10. Benefits or requirements, when configured.
11. Curriculum.
12. Sticky bottom action area on mobile when useful.

## 14.2 Instructor Section

Display only approved instructor information.

Avoid fabricated credentials, institution affiliations, teaching experience, or verification badges.

## 14.3 Curriculum Accordion

Each module row should contain:

* Module number or icon.
* Module title.
* Lecture count.
* Duration, if available.
* Access state.
* Expand/collapse control.

Expanded content should show lecture titles and relevant resource labels.

Use clear locked and preview states.

## 14.4 Sticky Enrollment Area

On mobile, a sticky action area may display:

* Price or access status.
* Preview action.
* Enrollment action.

It must respect safe areas and must not cover curriculum content.

On desktop, the action may appear in a course summary panel or another suitable layout.

# 15. My Learning Screen Design

## 15.1 Screen Objective

Help students understand their progress and continue learning without searching through the entire course catalog.

## 15.2 Layout

Follow the supplied My Learning reference.

Include:

1. Student header.
2. Course context.
3. Overall progress.
4. Completed lectures and available resources.
5. Continue Learning.
6. Active module.
7. Upcoming events.
8. Relevant alerts.

## 15.3 Progress Card

Use a white or subtle tinted surface with:

* Progress percentage.
* Progress bar.
* Completed lectures.
* Total eligible lectures.
* Notes count.
* Assignment or test summary only if implemented.

Do not crowd the card with too many small statistics.

## 15.4 Continue Learning

The primary action should be visually prominent.

Use a blue button with a clear action label.

A green label may indicate a genuine positive status, but green should not compete with the main action.

## 15.5 Upcoming and Alerts

Use distinct, compact cards for:

* Live class.
* Upcoming assignment.
* New notice.

Each card must include a clear action such as Join, Details, or View.

Do not make the entire alert section look like a collection of unrelated banners.

# 16. Classroom UI Design

## 16.1 Core Principle

The classroom must look and behave like a dedicated learning workspace.

When a student enters a course, the main application navigation must be replaced by classroom-specific navigation.

## 16.2 Classroom Header

Display:

* Back to My Learning.
* Course title.
* Course or subject label.
* Optional course menu.

Avoid placing too many icons in the header.

On mobile, long course titles may wrap or truncate gracefully.

## 16.3 Classroom Tabs

Required tabs:

* Overview.
* Lectures.
* Notes.
* Assignments.
* Notice Board.
* Progress.

The final set depends on the approved release scope.

The active tab must be visually distinct.

On small screens, use horizontal scrolling or another accessible compact pattern.

## 16.4 Classroom Overview

Display:

* Course progress.
* Continue Learning.
* Active module.
* Recently added learning resources.
* Upcoming live class.
* Relevant notices.

Use the same card, button, and typography tokens as the rest of the application.

## 16.5 Lectures

The lecture list must prioritize readability.

Each lecture item may display:

* Lecture title.
* Duration.
* Completion state.
* Preview or lock indicator.

Use a clear selected state for the current lecture.

Avoid excessive colored labels.

## 16.6 Notes

Use document cards or rows with:

* Document icon.
* Title.
* Related chapter.
* File type.
* Download or Open action.

Clearly distinguish available, downloading, downloaded, and unavailable states.

## 16.7 Assignments

Use consistent status labels:

* Not Started.
* Submitted.
* Under Review.
* Completed.
* Late, when applicable.

Only use states supported by the actual backend workflow.

## 16.8 Notice Board

Use a readable list with:

* Title.
* Date.
* Short summary.
* Priority when meaningful.
* View Details action.

Do not use large alert banners for every normal announcement.

# 17. Video Player UI

## 17.1 Layout

The player screen must prioritize video content.

Include:

* Player.
* Lecture title.
* Course or chapter context.
* Available playback controls.
* Previous/Next Lecture where supported.
* Notes or related resources.
* Back navigation.

On mobile, the player should use the available screen width and a suitable aspect ratio.

On desktop, the player may sit beside a lecture list or supporting content.

## 17.2 Playback States

Support visual states for:

* Loading.
* Playing.
* Paused.
* Playback failure.
* Video unavailable.
* Access revoked.
* Network interruption.

Do not overlay custom controls in a way that blocks the provider's required controls.

Playback quality options must reflect actual provider capabilities. Do not display fixed quality options unless they are genuinely available.

# 18. Notes and PDF UI

## 18.1 Notes List

Display:

* Document title.
* Chapter or lecture.
* File type.
* Download availability.
* Download state.

## 18.2 Download Interaction

The download button must change state appropriately:

* Download.
* Downloading.
* Downloaded.
* Retry.

Prevent repeated taps from starting duplicate downloads unnecessarily.

## 18.3 Document Viewer

If an in-app viewer is implemented, provide:

* Readable document layout.
* Loading indicator.
* Zoom or standard viewer controls where supported.
* Close/back navigation.
* Download or print action only when permitted.

If the viewer cannot display the file, show a clear fallback.

Do not claim that protected PDFs cannot be copied, photographed, or redistributed. The design must communicate access restrictions honestly.

# 19. Checkout and Coupon UI

Payment UI must be implemented only if the payment feature is approved.

## 19.1 Checkout Layout

Follow the supplied checkout reference.

Sections:

1. Header with back action.
2. Course summary.
3. Coupon code input.
4. Apply button.
5. Price breakdown.
6. Payment method selection, if supported.
7. Terms and Privacy Policy consent.
8. Secure payment information.
9. Sticky bottom total and Proceed to Pay button.

## 19.2 Price Hierarchy

The final payable amount must be easy to identify.

Use muted text for secondary price information and strong typography for the final amount.

Do not visually exaggerate discounts or use misleading original prices.

## 19.3 Coupon States

Support:

* Empty input.
* Invalid coupon.
* Valid coupon.
* Expired coupon.
* Ineligible course.
* Redemption limit reached.
* Applying.
* Apply failed.
* Coupon removed.

The displayed price must reflect the authoritative backend calculation.

## 19.4 Payment States

Support:

* Ready to pay.
* Processing.
* Pending.
* Failed.
* Verified.
* Cancelled.

Do not show a success animation or success screen before the backend confirms the relevant transaction result.

# 20. Notification UI

## 20.1 Layout

Follow the supplied notification reference.

Include:

* Header.
* Mark All as Read.
* Filter chips.
* Notification list.
* Unread indicator.
* Timestamp.
* Contextual action.
* Empty state.

## 20.2 Notification Card

Each card may contain:

* Category icon.
* Notification title.
* Summary.
* Relative timestamp.
* Unread state.
* Optional contextual action.

The title must be easy to scan.

The summary must not contain excessive text.

## 20.3 Notification Visual Hierarchy

Use semantic colors carefully.

Examples:

* Blue for academic updates.
* Green for genuine achievements.
* Amber for upcoming deadlines.
* Red for critical warnings only.

These are visual conventions, not mandatory colors for every notification.

The notification category must also be identifiable through text or accessible labeling.

# 21. Profile Screen UI

## 21.1 Layout

Follow the supplied Profile reference.

Include:

1. Profile header.
2. Avatar and student identity.
3. Edit Profile Details.
4. Student summary cards where supported.
5. Academic Details.
6. Certificates and Achievements, if implemented.
7. Downloaded Lectures, if implemented.
8. Notification preferences.
9. Help and Support.
10. Privacy Policy and Terms.
11. Sign Out.

## 21.2 Profile Header

Use a clear hierarchy between:

* Name.
* Contact information.
* Class or academic group.
* Profile action.

Use a fallback avatar when the student has no profile image.

Do not require a decorative cover image if it adds no useful information.

## 21.3 Summary Cards

Keep the number of summary cards limited.

Display only genuine metrics.

Do not display fabricated streaks, active-course counts, or certificates.

## 21.4 Sign-Out Action

The sign-out action must be visually distinct from ordinary settings.

Use a destructive color only where it communicates the meaning appropriately.

Ask for confirmation if the product policy requires it.

# 22. Admin Panel UI

The admin panel must use the same brand and design tokens but a productivity-focused desktop layout.

## 22.1 Admin Layout

Recommended structure:

* Persistent sidebar.
* Top header.
* Page title.
* Breadcrumbs where useful.
* Main content region.
* Search and filtering.
* Data tables or cards.
* Pagination.
* Contextual action menus.

## 22.2 Admin Modules

* Dashboard.
* Students.
* Courses.
* Subjects and Modules.
* Lectures.
* Notes and Documents.
* Live Classes.
* Assignments.
* Notices.
* Coupons.
* Enrollment.
* Payments, if enabled.
* Notifications.
* Sessions and Access Control.
* Audit Logs.
* Settings.

## 22.3 Tables

Tables must support:

* Readable column labels.
* Sorting when implemented.
* Search or filtering when useful.
* Pagination for large datasets.
* Empty states.
* Loading states.
* Row actions.
* Responsive overflow handling.

Do not shrink every column until the text becomes unreadable.

## 22.4 Admin Forms

Forms should be divided into logical sections.

Use clear labels and field-level validation.

Destructive actions require confirmation.

Bulk operations must communicate their scope before execution.

## 22.5 Admin Security Presentation

Hide irrelevant administrative controls from unauthorized roles.

However, hiding a control is only a UI behavior. Backend authorization must independently enforce every protected action.

# 23. Responsive Navigation

## 23.1 Mobile

Use the five primary student destinations:

* Home.
* Courses.
* My Learning.
* Alerts.
* Profile.

The active destination must be highlighted.

The navigation bar must not cover the last item in a scrollable screen.

## 23.2 Tablet

Use a layout appropriate to the available space.

Possible patterns:

* Bottom navigation.
* Navigation rail.
* Compact sidebar.

Choose a consistent pattern rather than changing navigation unpredictably between screens.

## 23.3 Desktop

Use a top navigation or sidebar according to the application area.

The admin panel should generally use a sidebar.

The student website may use a top navigation or sidebar depending on the screen.

The classroom must maintain its separate navigation context.

# 24. Accessibility Requirements

Target WCAG 2.2 AA for applicable web content and follow relevant platform accessibility guidance.

## 24.1 Color and Contrast

* Maintain required text contrast.
* Make active states visually clear.
* Do not rely on color alone.
* Provide readable disabled states.
* Ensure error messages are visible.

## 24.2 Keyboard Navigation

On web:

* All interactive controls must be keyboard accessible.
* Focus order must be logical.
* Focus indicators must be visible.
* Dialog focus must be managed correctly.
* Keyboard focus must not be hidden behind sticky controls.
* Avoid keyboard traps.

## 24.3 Touch and Pointer Targets

Make controls comfortably usable.

Use approximately 44–48 logical pixels as a preferred touch-target size for major mobile actions where practical.

For web, satisfy applicable WCAG 2.2 target-size requirements, including the 24-by-24 CSS pixel minimum criterion and its exceptions.

Do not treat the visible icon dimensions as the entire interactive target.

## 24.4 Text Scaling

* Support system text scaling where feasible.
* Avoid fixed-height text containers.
* Allow long labels to wrap.
* Avoid clipping error messages.
* Ensure dialogs remain usable at larger text sizes.

## 24.5 Screen Readers

Provide:

* Meaningful labels.
* Correct control roles.
* State announcements.
* Accessible progress descriptions.
* Alternative text for meaningful images.
* Clear form errors.

Decorative icons should not create repetitive or meaningless screen-reader announcements.

# 25. Responsive Content and Long-Text Handling

The interface must remain stable when real data differs from design examples.

Test:

* Very long course titles.
* Long instructor names.
* Missing thumbnails.
* Large lecture counts.
* Long chapter titles.
* Empty metadata.
* Long notification summaries.
* Large prices or discount values.
* Unusually long class or subject labels.
* Large profile names.
* Multilingual content.

Use wrapping, truncation, flexible sizing, or content expansion appropriately.

Never allow a button, card, or tab to overflow the viewport.

# 26. Loading, Empty, Error and Success States

Every major screen must define its states.

## 26.1 Loading

Use skeletons matching the final layout.

Avoid full-screen spinners when only one card or section is loading.

## 26.2 Empty

Provide a short explanation and a useful next action.

Examples:

* No enrolled courses → Explore Courses.
* No notes → Check Back Later or view available course content.
* No notifications → No New Notifications.
* No upcoming classes → No Upcoming Live Classes.

## 26.3 Error

Use a clear explanation and an appropriate recovery action.

Examples:

* Retry.
* Return to Course.
* Sign In Again.
* Contact Support.

Do not show internal error traces to users.

## 26.4 Success

Use concise confirmation.

Examples:

* Profile Updated.
* Assignment Submitted.
* Download Completed.
* Enrollment Confirmed.

Only show success after the operation actually succeeds.

# 27. UX Writing and Microcopy

Use concise, natural, understandable language.

Prefer action labels that clearly describe the result.

Examples:

* Continue Learning.
* Explore Courses.
* Open Course.
* View Notes.
* Download PDF.
* Join Live Class.
* View Assignment.
* Save Changes.
* Retry.
* Contact Support.

Avoid vague labels such as:

* Click Here.
* Do It.
* Process.
* Submit, when a more specific label is available.

Keep terminology consistent.

For example, do not alternate between “My Courses,” “Learning Library,” and “My Learning” for the same destination unless the product defines a meaningful difference.

## 27.1 Error Copy

Error messages should explain the situation without exposing implementation details.

Bad: `Firestore PERMISSION_DENIED exception`.

Better: `You no longer have access to this course. Contact support if you believe this is incorrect.`

The exact message must reflect the actual error. Do not display access-denied messaging for a temporary network failure.

# 28. Data-Driven UI Rules

The production interface must use actual application data.

## 28.1 Prohibited Fake Data

Do not use invented production values for:

* Student identity.
* Course prices.
* Course ratings.
* Review counts.
* Enrollment totals.
* Progress percentages.
* Certificates.
* Live-class times.
* Payment status.
* Course availability.
* Download status.

## 28.2 Development Fixtures

Mock data may be used for:

* UI prototyping.
* Storybook or component previews.
* Automated tests.
* Development-only screenshots.

Development fixtures must be isolated from production data sources.

The application must not silently fall back to fake production content when a backend request fails.

## 28.3 Dynamic Content

Design components must adapt to the data returned by the backend.

If a course has no rating, omit the rating section rather than showing a fabricated default.

If a promotion is unavailable, do not reserve a large empty banner for it unless the layout intentionally uses that space.

# 29. Performance and Perceived Speed

The UI must feel responsive on typical student devices and mobile connections.

Implement:

* Image sizing and optimization.
* Lazy loading where appropriate.
* List virtualization for long lists.
* Skeleton states.
* Debounced search.
* Stable component layouts.
* Avoidance of unnecessary re-renders.
* Efficient screen transitions.
* Pagination for large lists.
* Proper loading feedback on slow operations.

Do not sacrifice usability to achieve a visually elaborate effect.

# 30. Platform-Specific Considerations

## 30.1 Android

* Respect system navigation and safe areas.
* Handle the system Back button.
* Support keyboard-aware forms.
* Avoid content hidden behind system UI.
* Test on real Android devices.
* Keep navigation predictable.

## 30.2 iOS

* Respect safe areas.
* Use appropriate status-bar styling.
* Support expected navigation gestures where compatible.
* Handle keyboard presentation correctly.
* Ensure modal behavior is platform appropriate.
* Test on real iOS devices and supported simulator configurations.

## 30.3 Windows and Desktop Browsers

* Support mouse and keyboard.
* Provide visible focus states.
* Keep forms and reading layouts appropriately sized.
* Support browser zoom.
* Avoid hover-only essential functionality.
* Ensure dropdowns and dialogs remain within the viewport.
* Handle browser back and forward navigation.
* Avoid layouts that require mobile touch gestures.

# 31. Design Handoff and Implementation Rules

## 31.1 Before Implementing a Screen

The coding agent must identify:

* Screen purpose.
* Reference screenshot.
* Required content.
* Available backend data.
* Main action.
* Secondary actions.
* Navigation entry and exit points.
* Loading state.
* Empty state.
* Error state.
* Responsive behavior.
* Accessibility requirements.

## 31.2 During Implementation

* Reuse design tokens.
* Reuse existing shared components.
* Keep component files focused.
* Separate data logic from visual rendering.
* Avoid duplicated CSS and styling values.
* Use real icons from the selected icon library.
* Avoid emoji as substitutes for primary UI icons.
* Preserve existing working features.
* Avoid adding unapproved product scope.
* Keep mobile and web behavior consistent.

## 31.3 After Implementation

Review each screen for:

* Visual fidelity to the reference.
* Spacing consistency.
* Typography consistency.
* Correct color usage.
* Button and form behavior.
* Loading and error states.
* Responsive behavior.
* Keyboard accessibility.
* Text overflow.
* Backend data correctness.
* Functional navigation.
* Broken or fake actions.

## 31.4 Visual QA

Capture screenshots at representative mobile and desktop widths.

Compare them with the approved references.

Check:

* Header alignment.
* Card proportions.
* Text wrapping.
* Section spacing.
* Button dimensions.
* Navigation positioning.
* Safe-area handling.
* Bottom content visibility.
* Responsive column changes.

Do not declare the design complete based only on the desktop browser preview.

# 32. Suggested Component Structure

The actual repository structure may differ, but the following organization is recommended:

```text
packages/
  design-tokens/
    colors.ts
    typography.ts
    spacing.ts
    radii.ts
    elevation.ts
    motion.ts
    breakpoints.ts

  ui/
    buttons/
    inputs/
    badges/
    cards/
    dialogs/
    progress/
    navigation/
    feedback/
    icons/

apps/
  student-mobile/
    src/
      components/
      features/
        home/
        courses/
        learning/
        classroom/
        lectures/
        notes/
        assignments/
        notifications/
        profile/

  student-web/
    src/
      components/
      features/
      layouts/

  admin-web/
    src/
      components/
      features/
      layouts/
```

Use the actual monorepo structure defined in `ARCHITECTURE.md`. Do not create duplicate packages if equivalent modules already exist.

# 33. Design Acceptance Checklist

## Visual Consistency

* [ ] The app follows the approved blue, white, and light-lavender visual direction.
* [ ] Typography uses a consistent type scale.
* [ ] Cards share consistent spacing and radius rules.
* [ ] Buttons have consistent variants and states.
* [ ] Icons use one coherent visual style.
* [ ] Shadows and borders are restrained.
* [ ] Screens match the intent of the supplied references.

## Student Experience

* [ ] Home prioritizes continuing learning.
* [ ] Course Explorer supports search and filters.
* [ ] Course Details displays a clear curriculum.
* [ ] My Learning shows real progress.
* [ ] Classroom has separate navigation.
* [ ] Lectures and Notes are easy to find.
* [ ] Profile and Notifications are straightforward.
* [ ] Enrollment actions reflect the real account state.

## Responsive Behavior

* [ ] Android layouts work at supported screen sizes.
* [ ] iOS layouts respect safe areas.
* [ ] Mobile web remains usable.
* [ ] Windows desktop layouts use available width effectively.
* [ ] Long text does not break layouts.
* [ ] Sticky navigation does not cover content.
* [ ] Dialogs and forms remain usable on narrow screens.

## Accessibility

* [ ] Text contrast is validated.
* [ ] Interactive controls have meaningful labels.
* [ ] Keyboard navigation works on web.
* [ ] Focus states are visible.
* [ ] Text scaling does not cause clipping.
* [ ] Color is not the sole indicator of state.
* [ ] Touch targets are sufficiently usable.

## Functional Quality

* [ ] Buttons perform their advertised actions.
* [ ] Loading states are implemented.
* [ ] Empty states are implemented.
* [ ] Error states are implemented.
* [ ] Success states reflect confirmed operations.
* [ ] Production screens use real data.
* [ ] No unfinished feature is presented as operational.
* [ ] Backend authorization is not replaced by UI hiding.

# 34. Official Design References

Use these official resources during implementation.

**Material Design 3**

https://m3.material.io/

**Android Developers — Material 3 theming**

https://developer.android.com/codelabs/m3-design-theming

**Apple Human Interface Guidelines**

https://developer.apple.com/design/human-interface-guidelines/

**W3C Web Content Accessibility Guidelines 2.2**

https://www.w3.org/TR/WCAG22/

**W3C Understanding Target Size**

https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

Use these resources as design and accessibility references. Confirm the current guidance and platform support during implementation.

# 35. Final Design Definition

Bikash Bhaiya Classes must use a consistent, modern educational design system based on the supplied screenshots.

The final interface must combine:

* Light lavender backgrounds.
* White cards.
* Blue primary actions.
* Premium but readable typography.
* Consistent spacing and rounded corners.
* Clear course discovery.
* Readable curriculum and lecture lists.
* Meaningful progress indicators.
* Separate classroom navigation.
* Well-structured checkout and notification screens.
* A professional profile experience.
* Responsive student web and mobile interfaces.
* A productivity-focused admin panel.

The UI must remain functional, data-driven, accessible, responsive, and maintainable.

**Final instruction:** Build a cohesive product, not a collection of isolated mockups. Every screen must follow the same design system, every interactive control must have a real outcome, and every layout must remain usable across the supported platforms.
