const fs = require('fs');
const path = require('path');

const dirs = [
  'apps/mobile/app/(auth)',
  'apps/mobile/app/(tabs)',
  'apps/mobile/app/courses',
  'apps/mobile/app/classroom',
  'apps/mobile/src/components',
  'apps/mobile/src/features',
  'apps/mobile/src/services',
  'apps/mobile/src/hooks',
  'apps/mobile/src/providers',
  'apps/mobile/src/theme',
  'apps/mobile/src/types',
  'apps/mobile/src/utils',
  'apps/mobile/tests',
  
  'apps/student-web/src/components',
  'apps/student-web/src/features',
  'apps/student-web/src/services',
  'apps/student-web/src/hooks',
  'apps/student-web/src/lib',
  'apps/student-web/src/theme',
  'apps/student-web/src/types',
  'apps/student-web/src/utils',
  'apps/student-web/tests',
  
  'apps/admin/src/app/(auth)',
  'apps/admin/src/app/(dashboard)',
  'apps/admin/src/app/api',
  'apps/admin/src/components',
  'apps/admin/src/features/dashboard',
  'apps/admin/src/features/students',
  'apps/admin/src/features/courses',
  'apps/admin/src/features/lessons',
  'apps/admin/src/features/enrollments',
  'apps/admin/src/features/resources',
  'apps/admin/src/features/notices',
  'apps/admin/src/features/assignments',
  'apps/admin/src/features/coupons',
  'apps/admin/src/features/sessions',
  'apps/admin/src/features/notifications',
  'apps/admin/src/features/payments',
  'apps/admin/src/features/audit-logs',
  'apps/admin/src/services',
  'apps/admin/src/lib',
  'apps/admin/src/hooks',
  'apps/admin/src/types',
  'apps/admin/src/utils',
  'apps/admin/src/tests',
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

// Create layout for mobile
fs.writeFileSync(path.join(__dirname, 'apps/mobile/app/_layout.tsx'), 'export default function Layout() { return null; }');

// Create readmes
fs.writeFileSync(path.join(__dirname, 'apps/mobile/README.md'), '# Mobile App\n\nStudent mobile application built with Expo (React Native). Must not import web components.');
fs.writeFileSync(path.join(__dirname, 'apps/student-web/README.md'), '# Student Web App\n\nStudent-facing Next.js application. Must not contain admin routes or dashboard.');
fs.writeFileSync(path.join(__dirname, 'apps/admin/README.md'), '# Admin Web App\n\nAdmin Next.js application. Hosted independently and protected by server-side authorization.');

console.log('App structures created.');
