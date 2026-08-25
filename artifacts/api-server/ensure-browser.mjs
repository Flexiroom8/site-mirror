import { access, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import puppeteer from "puppeteer";

const executablePath = puppeteer.executablePath();

console.log("");
console.log("==============================================");
console.log(" Puppeteer Chrome Verification");
console.log("==============================================");
console.log(`Chrome executable: ${executablePath}`);
console.log("");

async function chromeExists() {
  try {
    await access(executablePath);
    return true;
  } catch {
    return false;
  }
}

async function installChrome() {
  console.log("Chrome was not found.");
  console.log("Installing the Chrome revision required by Puppeteer...");
  console.log("");

  await mkdir(dirname(executablePath), {
    recursive: true,
  }).catch(() => {});

  const commands = [
    {
      command: "pnpm",
      args: [
        "exec",
        "puppeteer",
        "browsers",
        "install",
        "chrome"
      ]
    },
    {
      command: "npx",
      args: [
        "puppeteer",
        "browsers",
        "install",
        "chrome"
      ]
    }
  ];

  for (const attempt of commands) {
    console.log(
      `Running: ${attempt.command} ${attempt.args.join(" ")}`
    );

    const result = spawnSync(
      attempt.command,
      attempt.args,
      {
        stdio: "inherit",
        env: {
          ...process.env,
          PUPPETEER_SKIP_DOWNLOAD: "false"
        }
      }
    );

    if (result.error) {
      console.warn(
        `${attempt.command} could not be executed:`,
        result.error.message
      );
      continue;
    }

    if (result.status === 0) {
      if (await chromeExists()) {
        console.log("");
        console.log("Chrome installed successfully.");
        return true;
      }
    }
  }

  return false;
}

if (await chromeExists()) {
  console.log("Chrome is already installed.");
  console.log("");
  process.exit(0);
}

const installed = await installChrome();

if (!installed) {
  console.error("");
  console.error("==============================================");
  console.error(" ERROR: Puppeteer Chrome is unavailable");
  console.error("==============================================");
  console.error("");
  console.error(`Expected Chrome at: ${executablePath}`);
  console.error("");
  console.error(
    "Try manually running:"
  );
  console.error("");
  console.error(
    "pnpm exec puppeteer browsers install chrome"
  );
  console.error("");

  process.exit(1);
}

console.log("");
console.log("Puppeteer browser check complete.");
console.log("");
