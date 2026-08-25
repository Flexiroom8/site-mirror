```text
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

const executablePath = puppeteer.executablePath();

console.log("Puppeteer executable:");
console.log(executablePath);
console.log("");

function exists(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

if (exists(executablePath)) {
  console.log("Chrome is already installed.");
  console.log("");
  console.log("==============================================");
  console.log(" Puppeteer Chrome: READY");
  console.log("==============================================");
  console.log("");
  process.exit(0);
}

console.log("Chrome executable was not found.");
console.log("");
console.log("Cleaning incomplete Puppeteer cache...");
console.log("");

const cacheDirectories = [];

if (process.env.PUPPETEER_CACHE_DIR) {
  cacheDirectories.push(
    path.resolve(process.env.PUPPETEER_CACHE_DIR)
  );
}

if (process.env.HOME) {
  cacheDirectories.push(
    path.join(process.env.HOME, ".cache", "puppeteer")
  );
}

cacheDirectories.push(
  path.resolve(".cache", "puppeteer")
);

for (const cacheDirectory of [...new Set(cacheDirectories)]) {
  if (!fs.existsSync(cacheDirectory)) {
    continue;
  }

  console.log(`Removing: ${cacheDirectory}`);

  try {
    fs.rmSync(cacheDirectory, {
      recursive: true,
      force: true
    });
  } catch (error) {
    console.log(
      `Warning: could not remove ${cacheDirectory}`
    );
    console.log(error.message);
  }
}

console.log("");
console.log("Installing Puppeteer Chrome...");
console.log("");

try {
  execFileSync(
    "pnpm",
    [
      "exec",
      "puppeteer",
      "browsers",
      "install",
      "chrome"
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PUPPETEER_SKIP_DOWNLOAD: "false"
      }
    }
  );
} catch (error) {
  console.error("");
  console.error("Chrome installation failed.");
  console.error("");
  console.error(error.message);
  console.error("");
  process.exit(1);
}

console.log("");
console.log("Verifying Chrome...");
console.log("");

const finalExecutablePath = puppeteer.executablePath();

console.log("Chrome executable:");
console.log(finalExecutablePath);
console.log("");

if (!exists(finalExecutablePath)) {
  console.error("ERROR: Chrome executable still does not exist.");
  console.error("");
  console.error(finalExecutablePath);
  console.error("");
  process.exit(1);
}

try {
  fs.accessSync(
    finalExecutablePath,
    fs.constants.X_OK
  );
} catch {
  console.log("Chrome is not executable.");
  console.log("Attempting to fix permissions...");

  try {
    fs.chmodSync(
      finalExecutablePath,
      0o755
    );
  } catch (error) {
    console.error("");
    console.error(
      `Unable to make Chrome executable: ${error.message}`
    );
    console.error("");
    process.exit(1);
  }
}

console.log("");
console.log("Chrome installation verified successfully.");
console.log("");
console.log("==============================================");
console.log(" Puppeteer Chrome: READY");
console.log("==============================================");
console.log("");
```
