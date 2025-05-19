import { exec } from "child_process";
import { glob } from "glob";

async function runMarkdownLinkCheck(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`npx markdown-link-check -c .markdown-link-check.json ${filePath}`, (error, stdout, stderr) => {
      if (error?.message.includes("ERROR")) {
        return reject(error);
      }
      if (stderr.includes("ERROR")) {
        return reject(stdout);
      }
      resolve();
    });
  });
}

(async () => {
  try {
    console.log("🧐 Checking links in Markdown files");

    const markdownFiles = await glob("./docs/**/*.md");
    markdownFiles.push("./README.md");

    await Promise.all(markdownFiles.map(runMarkdownLinkCheck));

    console.log("👌 All checks completed");
  } catch (error) {
    console.error("☹️  Error occurred during the link verification process");
    console.error(error);
    process.exit(1);
  }
})();
