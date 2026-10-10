# DESIGN.md — Bikash Bhaiya Classes

## Design Philosophy
The design must be clean, simple, and student-friendly, focusing on legibility and ease of use. It should convey a premium, modern feel without unnecessary complexity.

## Theme & Tokens
- **Primary Theme**: Blue
- **Surface Colors**: Lavender-tinted neutrals for softer backgrounds (as per UI-UX design brief).
- **Typography**: Clean, sans-serif fonts (e.g., Inter or Roboto) for high readability on all screen sizes.
- **Spacing**: Consistent 4pt/8pt grid system.

## Components
- Components are designed to be reusable and platform-agnostic where possible.
- When platform-specific behavior is required (e.g., navigation in React Native vs. Next.js), components will use shared design tokens but platform-specific implementations.

## Responsive Behavior
- Web interfaces are fully responsive. Mobile layouts focus on stacked cards and easy touch targets.
- Desktop layouts utilize sidebars and expanded tables for admin features.

## Accessibility
- Strong contrast ratios for text.
- Proper focus states for all interactive elements.
- Meaningful error states and empty states across all screens.
