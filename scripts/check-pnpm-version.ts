import { execSync } from 'child_process';
import pathUtils from 'node:path';
import fs from 'node:fs';

(() => {
  const currentPnpmVersion = execSync('pnpm --version', {
    encoding: 'utf-8',
  }).trim();
  const packageJson = JSON.parse(
    fs
      .readFileSync(pathUtils.resolve(__dirname, '..', 'package.json'))
      .toString()
  );
  const expectedPnpmVersionWithMaybeHash = (
    packageJson['packageManager'] as string
  ).split('@')[1];

  if (!expectedPnpmVersionWithMaybeHash.startsWith(currentPnpmVersion)) {
    console.log(
      `This project requires pnpm@${expectedPnpmVersionWithMaybeHash}. Detected pnpm@${currentPnpmVersion}.`
    );
    process.exit(1);
  }
})();
