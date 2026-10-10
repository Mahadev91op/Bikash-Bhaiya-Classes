# Monorepo Structure

This project is organized as a strict monorepo. The goal is to provide independent builds, deployments, and testing environments for each of the core applications while sharing domain models and validation rules.

## Applications
- **apps/mobile**: The student mobile application (Android/iOS) built with Expo. This application owns all native mobile implementation, screens, routing, and mobile assets. It does not import web components.
- **apps/student-web**: The student-facing web application built with Next.js. It owns all student web pages and routing. It must not import admin-specific components.
- **apps/admin**: The administrative web portal built with Next.js. It owns all administrative pages, data tables, and privileged routing. It is hosted independently.

## Backend
- **functions**: Firebase Cloud Functions. Owns all server-side privileged operations, data manipulation that requires strict validation, and Firebase Admin SDK integrations.

## Shared Packages
- **packages/shared-types**: TypeScript interfaces used across all apps.
- **packages/shared-validation**: Common validation logic.
- **packages/shared-config**: Platform constants.
- **packages/design-tokens**: Shared styling variables like colors, spacing, and typography.
