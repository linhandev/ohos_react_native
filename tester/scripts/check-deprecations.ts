import * as fs from 'fs/promises';
import * as path from 'path';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

interface DeprecatedItem {
  filePath: string;
  lineNumber: number;
  context: string | undefined;
  rnohVersion: string;
}

async function main() {
  try {
    const allRNOHVersions = await getRNOHVersions();
    const allDeprecatedItems = await findRecursivelyDeprecatedItemsInDirectory(
      process.cwd(),
      ['.ts', '.ets', '.cpp', '.h'],
    );
    allDeprecatedItems.sort((a, b) => {
      return compareRNOHVersions(b.rnohVersion, a.rnohVersion);
    });
    const deprecatedItemsByRNOHVersion = new Map<string, DeprecatedItem[]>();
    if (allDeprecatedItems.length > 0) {
      console.log(stylize.gray('Deprecated items:'));
      allDeprecatedItems.forEach(item => {
        if (!deprecatedItemsByRNOHVersion.has(item.rnohVersion)) {
          deprecatedItemsByRNOHVersion.set(item.rnohVersion, []);
        }
        deprecatedItemsByRNOHVersion.get(item.rnohVersion)!.push(item);
        console.log('\n');
        console.log(stylize.gray(`File: ${item.filePath}:${item.lineNumber}`));
        if (item.context) {
          console.log(stylize.gray(`Context: ${item.context}`));
        }
        console.log(
          stylize.gray(`Deprecated since version: ${item.rnohVersion}`),
        );
      });

      console.log(
        stylize.bold('\nDEPRECATED SOFTWARE ELEMENTS COUNT BY RNOH VERSION:'),
      );
      Array.from(deprecatedItemsByRNOHVersion.entries())
        .sort(([a], [b]) => {
          return compareRNOHVersions(a, b) * -1;
        })
        .forEach(([rnohVersion, deprecatedItems]) => {
          if (shouldBeRemoved(rnohVersion, allRNOHVersions, 12)) {
            console.info(
              `- ${rnohVersion}:`,
              stylize.bold(stylize.red(deprecatedItems.length.toString())),
            );
          } else if (shouldBeRemoved(rnohVersion, allRNOHVersions, 8)) {
            console.info(
              `- ${rnohVersion}:`,
              stylize.bold(stylize.yellow(deprecatedItems.length.toString())),
            );
          } else {
            console.info(
              stylize.gray(`- ${rnohVersion}:`),
              stylize.gray(deprecatedItems.length.toString()),
            );
          }
        });
      process.exit(0);
    } else {
      console.log('No deprecated items found that need removal.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running deprecation checker:', error);
    process.exit(1);
  }
}

async function getRNOHVersions(): Promise<string[]> {
  try {
    const {stdout} = await execAsync('git tag');
    return stdout
      .split('\n')
      .filter(tag => /^v\d/.test(tag))
      .map(tag => tag.substring(1))
      .sort(compareRNOHVersions);
  } catch (error) {
    console.error('Error getting git tags:', error);
    return [];
  }
}

async function findRecursivelyDeprecatedItemsInDirectory(
  dirPath: string,
  fileExtensions: string[],
): Promise<DeprecatedItem[]> {
  const items: DeprecatedItem[] = [];
  async function* walk(directory: string): AsyncGenerator<string> {
    const dirents = await fs.readdir(directory, {withFileTypes: true});
    for (const dirent of dirents) {
      const filePath = path.join(directory, dirent.name);
      if (dirent.isDirectory()) {
        if (
          !dirent.name.startsWith('.') &&
          dirent.name !== 'node_modules' &&
          dirent.name !== 'third-party' &&
          dirent.name !== 'cache'
        ) {
          yield* walk(filePath);
        }
      } else if (fileExtensions.some(ext => dirent.name.endsWith(ext))) {
        yield filePath;
      }
    }
  }
  for await (const filePath of walk(dirPath)) {
    const fileItems = await findDeprecatedItemsInFile(filePath);
    items.push(...fileItems);
  }

  return items;
}

function compareRNOHVersions(
  lhsVersion: string,
  rhsVersion: string,
): -1 | 0 | 1 {
  const lhsParts = lhsVersion.split('.').map(part => parseInt(part));
  const rhsParts = rhsVersion.split('.').map(part => parseInt(part));
  for (let i = 0; i < Math.max(lhsParts.length, rhsParts.length); i++) {
    const lhsPart = lhsParts[i] || 0;
    const rhsPart = rhsParts[i] || 0;
    if (lhsPart !== rhsPart) {
      return lhsPart - rhsPart > 0 ? 1 : -1;
    }
  }
  return 0;
}

async function findDeprecatedItemsInFile(
  filePath: string,
): Promise<DeprecatedItem[]> {
  const deprecatedRegex = /.*?latestRNOHVersion:\s*([\d.]+)/;
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const deprecatedItems: DeprecatedItem[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(deprecatedRegex);
    if (match) {
      const rnohVersion = match[1];
      let context: string | undefined;
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (
          nextLine &&
          !nextLine.startsWith('*') &&
          !nextLine.startsWith('/')
        ) {
          context = nextLine;
          break;
        }
      }
      deprecatedItems.push({
        filePath,
        lineNumber: i + 1,
        context,
        rnohVersion,
      });
    }
  }
  return deprecatedItems;
}

const stylize = {
  red: (message: string) => `\x1b[31m${message}\x1b[0m`,
  yellow: (message: string) => `\x1b[33m${message}\x1b[0m`,
  gray: (message: string) => `\x1b[38;5;245m${message}\x1b[0m`,
  blue: (message: string) => `\x1b[34m${message}\x1b[0m`,
  green: (message: string) => `\x1b[32m${message}\x1b[0m`,
  bold: (message: string) => `\x1b[1m${message}\x1b[22m`,
};

function shouldBeRemoved(
  deprecatedVersion: string,
  currentVersions: string[],
  releasesFromDeprecationThreshold: number,
): boolean {
  const deprecatedVersionIndex = currentVersions.indexOf(deprecatedVersion);
  if (deprecatedVersionIndex === -1) {
    return false;
  }
  const releasesSinceDeprecation =
    currentVersions.length - deprecatedVersionIndex - 1;
  return releasesSinceDeprecation >= releasesFromDeprecationThreshold;
}

main();
