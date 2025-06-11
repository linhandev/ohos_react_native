import { exec } from 'node:child_process';
import { glob } from 'glob';
import fs from 'node:fs';
import pathUtils from 'node:path';

async function runMarkdownLinkCheck(
  filePath: string
): Promise<{ ok: true; error?: never } | { ok?: never; error: string }> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      resolve({ error: `${filePath} doesn't exist` });
      return;
    }
    exec(`npx markdown-link-check ${filePath}`, (error, stdout, stderr) => {
      if (error?.message.includes('ERROR')) {
        resolve({ error: filePath + ': ' + error.message + '\n' + stdout });
        return;
      }
      if (stderr.includes('ERROR')) {
        resolve({ error: filePath + ': ' + stderr + '\n' + stdout });
        return;
      }
      resolve({ ok: true });
    });
  });
}

(async () => {
  try {
    const ignoreFilePathPatterns = [
      `docs${pathUtils.sep}Samples`,
      `docs${pathUtils.sep}zh-cn`,
    ];
    console.log(
      `🧐 Checking links in Markdown files except: ${ignoreFilePathPatterns.join(', ')}`
    );
    const markdownFiles = (await glob('./docs/**/*.md')).filter((filePath) => {
      return !ignoreFilePathPatterns.some((pattern) =>
        filePath.includes(pattern)
      );
    });
    markdownFiles.push('./README.md');

    const errorMsg = (
      await Promise.all(markdownFiles.map(runMarkdownLinkCheck))
    )
      .filter((result) => !!result.error)
      .reduce((acc, result) => {
        acc += result.error;
        return acc;
      }, '');
    if (errorMsg) {
      throw new Error(errorMsg);
    }

    console.log('👌 All checks completed');
  } catch (error) {
    console.error('☹️  Error occurred during the link verification process');
    console.error(error);
    process.exit(1);
  }
})();
