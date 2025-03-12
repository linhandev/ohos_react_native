import { execSync } from 'child_process';

(() => {
  const currentPnpmVersion = execSync('pnpm --version', {
    encoding: 'utf-8',
  }).trim();

  const versionSegments = currentPnpmVersion.split('.');
  if (versionSegments.length != 3) {
    console.log(
      `Tried to check pnpm version but the version is invalid: ${currentPnpmVersion}`
    );
    process.exit(1);
  }
  if (parseInt(versionSegments[0]) < 10) {
    console.log(`This project requires pnpm v10+`);
    process.exit(1);
  }
})();
