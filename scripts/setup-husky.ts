import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function installHuskyHooks() {
  try {
    const huskyDir = path.resolve('.husky');
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir);
    }
    execSync('npx husky install .husky', { stdio: 'inherit' });

    const prePushHookPath = path.resolve('.husky/pre-push');

    let hookExists = false;
    if (fs.existsSync(prePushHookPath)) {
      const hookContent = fs.readFileSync(prePushHookPath, 'utf8');
      hookExists = hookContent.includes('pnpm run verify');
    }

    if (!hookExists) {
      execSync('npx husky add .husky/pre-push "pnpm run verify"', {
        stdio: 'inherit',
      });
      console.log('Pre-push hook added successfully.');
    } else {
      console.log('Pre-push hook already configured.');
    }
  } catch (error) {
    console.error('Error installing Husky hooks:', error);
    process.exit(1);
  }
}

installHuskyHooks();
