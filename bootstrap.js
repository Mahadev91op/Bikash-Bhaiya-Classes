const { execSync } = require('child_process');
const path = require('path');

function run(cmd, cwd) {
  console.log(`Running: ${cmd} in ${cwd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

const appsDir = path.join(__dirname, 'apps');

try {
  // Mobile app
  run('npx -y create-expo-app@latest mobile -t expo-template-blank-typescript', appsDir);
} catch (e) { console.error('Mobile bootstrap failed', e.message); }

try {
  // Student Web
  run('npx -y create-next-app@14 student-web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm', appsDir);
} catch (e) { console.error('Student web bootstrap failed', e.message); }

try {
  // Admin Web
  run('npx -y create-next-app@14 admin --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm', appsDir);
} catch (e) { console.error('Admin web bootstrap failed', e.message); }
