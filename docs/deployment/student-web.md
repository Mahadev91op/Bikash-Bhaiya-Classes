# Student Web Deployment

## Overview
The student web application (`apps/student-web`) is built with Next.js and is meant to be hosted independently of the admin application.

## Build Process
To build the application for production:
```bash
npm run build --workspace=apps/student-web
```

## Hosting Platforms (e.g., Vercel, Netlify)
When deploying to a hosting provider that supports monorepos:
1. **Root Directory**: Set the root directory to `apps/student-web`.
2. **Build Command**: Set the build command to `npm run build` or let the provider infer it.
3. **Environment Variables**: Provide all required variables as defined in `.env.example`. Make sure NOT to expose Admin service accounts here.

The application must not rely on the admin website being deployed simultaneously.
