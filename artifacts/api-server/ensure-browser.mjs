```js
#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer";

console.log("");
console.log("==============================================");
console.log(" Puppeteer Chrome Verification");
console.log("==============================================");
console.log("");

function fileExists(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

function directoryExists(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function getChromePath() {
  try {
    const executable = puppeteer.executablePath();

    if (executable && fileExists(executable)) {
      return executable;
    }

    return executable || null;
  } catch (error) {
    console.log(`Unable to determine Puppeteer executable: ${error.message}`);
    return null;
  }
}

function removeBrokenCache() {
  const cacheDirectories = new Set();

  /*
   * Puppeteer normally uses ~/.cache/puppeteer in Linux.
   *
   * Some deployment environments expose HOME as /home/runner,
   * while this project may also have a local .cache directory.
   */
  if (process.env.PUPPETEER_CACHE_DIR) {
    cacheDirectories.add(
      path.resolve(process.env.PUPPETEER_CACHE_DIR)
    );
  }

  if (process.env.HOME) {
    cacheDirectories.add(
      path.join(process.env.HOME, ".cache", "puppeteer")
    );
  }

  cacheDirectories.add(
    path.resolve(".cache", "puppeteer")
  );

  for (const cacheDir of cacheDirectories) {
    if (!directoryExists(cacheDir)) {
      continue;
    }

    console.log(`Removing Puppeteer cache: ${cacheDir}`);

    try {
      fs.rmSync(cacheDir, {
        recursive: true,
        force: true,
      });

      console.log(`Removed: ${cacheDir}`);
    } catch (error) {
      console.log(
        `Warning: unable to completely remove ${cacheDir}: ${error.message}`
      );
    }
  }

  console.log("");
}

function installChrome() {
  console.log("Installing Puppeteer's Chrome browser...");
  console.log("");

  /*
   * Use the Puppeteer package installed by this workspace.
   * Do NOT use `npx` because it can resolve a different Puppeteer version.
   */
  execFileSync(
    "pnpm",
    [
      "exec",
      "puppeteer",
      "browsers",
      "install",
      "chrome",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PUPPETEER_SKIP_DOWNLOAD: "false",
      },
    }
  );
}

function verifyChrome() {
  const executable = getChromePath();

  if (!executable) {
    throw new Error(
      "Puppeteer did not return a Chrome executable path."
    );
  }

  console.log(`Expected Chrome executable: ${executable}`);
  console.log("");

  if (!fileExists(executable)) {
    throw new Error(
      `Chrome executable does not exist:\n${executable}`
    );
  }

  try {
    fs.accessSync(executable, fs.constants.X_OK);
  } catch {
    console.log(
      "Chrome exists but is not executable. Attempting to fix permissions..."
    );

    try {
      fs.chmodSync(executable, 0o755);
    } catch (error) {
      throw new Error(
        `Chrome exists but could not be made executable: ${error.message}`
      );
    }
  }

  return executable;
}

async function main() {
  console.log(`Puppeteer version: ${puppeteer.version()}`);

  let executable = getChromePath();

  if (executable && fileExists(executable)) {
    console.log(`Chrome executable: ${executable}`);
    console.log("");
    console.log("Chrome is already installed.");
    console.log("");
    console.log("==============================================");
    console.log(" Puppeteer Chrome: READY");
    console.log("==============================================");
    console.log("");

    return;
  }

  console.log(
    `Chrome is unavailable at the Puppeteer path: ${executable || "unknown"}`
  );

  console.log("");
  console.log(
    "A previous deployment may have left an incomplete Puppeteer cache."
  );
  console.log("Cleaning the cache before reinstalling...");
  console.log("");

  removeBrokenCache();

  try {
    installChrome();
  } catch (error) {
    console.error("");
    console.error("Chrome installation failed.");
    console.error("");
    console.error(error?.stack || error);
    console.error("");

    process.exit(1);
  }

  console.log("");
  console.log("Verifying Chrome installation...");
  console.log("");

  try {
    executable = verifyChrome();
  } catch (error) {
    console.error("");
    console.error("==============================================");
    console.error(" ERROR: Puppeteer Chrome is unavailable");
    console.error("==============================================");
    console.error("");
    console.error(error?.stack || error);
    console.error("");

    process.exit(1);
  }

  console.log(`Chrome executable: ${executable}`);
  console.log("");
  console.log("Chrome installation verified successfully.");
  console.log("");
  console.log("==============================================");
  console.log(" Puppeteer Chrome: READY");
  console.log("==============================================");
  console.log("");
}

await main();
```
