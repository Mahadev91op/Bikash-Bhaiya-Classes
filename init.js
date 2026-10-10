const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirs = [
  'apps/mobile',
  'apps/student-web',
  'apps/admin',
  'packages/shared-types',
  'packages/shared-validation',
  'packages/shared-config',
  'packages/design-tokens',
  'functions/src',
  'firebase',
  'docs/setup',
  'docs/security',
  'docs/deployment',
  'docs/decisions',
  'scripts',
  '.github/workflows'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

// Move docs if needed
const docsFiles = ['PRD.md', 'TRD.md', 'AppFlow.md', 'UI-UX-design-Brief.md'];
docsFiles.forEach(file => {
  const src = path.join(__dirname, 'docs', file);
  const dest = path.join(__dirname, file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
  }
});

// Init npm if not exist
if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
  execSync('npm init -y', { stdio: 'inherit' });
}

// Update package.json for workspaces
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.workspaces = ['apps/*', 'packages/*', 'functions'];
pkg.scripts = {
  "dev:mobile": "npm run start --workspace=apps/mobile",
  "dev:student": "npm run dev --workspace=apps/student-web",
  "dev:admin": "npm run dev --workspace=apps/admin",
  "dev:functions": "npm run serve --workspace=functions",
  "lint": "npm run lint --workspaces --if-present",
  "typecheck": "npm run typecheck --workspaces --if-present",
  "test": "npm run test --workspaces --if-present"
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

console.log('Directories created and package.json updated.');
