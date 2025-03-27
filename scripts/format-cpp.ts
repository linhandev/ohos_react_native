import { exec, execSync } from 'node:child_process';
import { glob } from 'glob';
import pathUtils from 'node:path';

if (require.main === module) {
  (async () => {
    try {
      if (process.argv.length > 2 && process.argv[2] === '--check') {
        await checkClangFormat();
      } else {
        await clangFormat();
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}

async function checkClangFormat(): Promise<void> {
  const clangFormatPath = await getClangFormatPath();
  const changedFiles = await findChangedCppFiles();
  if (changedFiles.size === 0) {
    return;
  }
  const command = `"${clangFormatPath}" --dry-run --Werror --style=file:.clang-format ${stringifyFilePaths(changedFiles)}`;

  execSync(command, { stdio: 'inherit' });
}

async function clangFormat(): Promise<void> {
  const clangFormatPath = await getClangFormatPath();
  const changedFiles = await findChangedCppFiles();
  if (changedFiles.size === 0) {
    return;
  }
  const command = `"${clangFormatPath}" -i ${stringifyFilePaths(changedFiles)} --style=file:.clang-format`;

  execSync(command, { stdio: 'inherit' });
}

async function getClangFormatPath(): Promise<string> {
  const sdkHome = process.env.DEVECO_SDK_HOME;
  if (!sdkHome) {
    console.error('DEVECO_SDK_HOME environment variable is not set');
    process.exit(1);
  }
  const clangFormatPathCandidates = await glob(
    `${pathUtils.join(sdkHome, '..')}/**/clang-format${process.platform === 'win32' ? '.exe' : ''}`,
    { nodir: true }
  );
  if (clangFormatPathCandidates.length === 0) {
    console.error('clang-format not found in DEVECO_SDK_HOME');
    process.exit(1);
  }
  return clangFormatPathCandidates[0];
}

export async function findChangedCppFiles(): Promise<Set<string>> {
  const changedFiles = await findChangedFiles();
  for (const path of changedFiles) {
    if (
      (!path.endsWith('.cpp') && !path.endsWith('.h')) ||
      path.includes('third-party') ||
      path.includes('generated') ||
      path.includes('patches')
    ) {
      changedFiles.delete(path);
    }
  }
  return changedFiles;
}

export async function findChangedFiles(): Promise<Set<string>> {
  try {
    const currentBranch = execSync('git branch --show-current')
      .toString()
      .trim();
    const revList = execSync(
      `git rev-list --exclude ${currentBranch} --branches -1`
    )
      .toString()
      .trim();
    const diffFromBranchCmd = `git diff --name-only --diff-filter=d ${revList} HEAD`;
    const diffUnstagedCmd = 'git diff --name-only --diff-filter=d';
    const diffStagedCmd = 'git diff --name-only --diff-filter=d --cached';
    const result = await Promise.all([
      execGitDiffCommand(diffFromBranchCmd),
      execGitDiffCommand(diffUnstagedCmd),
      execGitDiffCommand(diffStagedCmd),
    ]);
    return new Set(result.flat());
  } catch (error) {
    console.error(error);
    return new Set();
  }
}

async function execGitDiffCommand(command: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const files = stdout.trim().split('\n').filter(Boolean);
      resolve(files);
    });
  });
}

function stringifyFilePaths(changedFiles: Set<string>): string {
  return Array.from(changedFiles).join(' ');
}
