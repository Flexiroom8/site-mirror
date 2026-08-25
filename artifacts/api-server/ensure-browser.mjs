#!/usr/bin/env node

import fs from "node:fs";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer";

console.log("");
console.log("==============================================");
console.log(" Puppeteer Chrome Verification");
console.log("==============================================");
console.log("");

var chromePath;

try {
chromePath = puppeteer.executablePath();
} catch (error) {
console.error("Unable to determine Puppeteer Chrome path.");
console.error(String(error));
process.exit(1);
}

console.log("Puppeteer Chrome path:");
console.log(chromePath);
console.log("");

function chromeExists() {
try {
return fs.existsSync(chromePath);
} catch (error) {
return false;
}
}

if (chromeExists()) {
console.log("Chrome is already installed.");
console.log("");
console.log("Puppeteer Chrome: READY");
console.log("");
process.exit(0);
}

console.log("Chrome is not installed.");
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
console.error("Puppeteer Chrome installation failed.");
console.error("");
console.error(String(error));
console.error("");
process.exit(1);
}

console.log("");
console.log("Checking Chrome installation...");
console.log("");

try {
chromePath = puppeteer.executablePath();
} catch (error) {
console.error("Unable to determine Chrome path after installation.");
console.error(String(error));
process.exit(1);
}

console.log("Chrome path:");
console.log(chromePath);
console.log("");

if (!chromeExists()) {
console.error("ERROR: Chrome executable was not found.");
console.error("");
console.error(chromePath);
console.error("");
process.exit(1);
}

console.log("Chrome executable found.");
console.log("");
console.log("Puppeteer Chrome: READY");
console.log("");

````

**Important:** the actual file must begin with `#!/usr/bin/env node` and end with `console.log("");`. Do not put Markdown fences into the file.

### Why this should fix the immediate error

Your latest error is:

```text
SyntaxError: Unexpected identifier 'Removing'
````

at:

```js
console.log(`Removing: ${cacheDirectory}`);
```

There is no reason for us to use that template-string code in the first place. The new file contains **zero backticks**.

It also removes the cache-deletion logic for now. That's deliberate.

Puppeteer 24.43.1 should report its expected browser location through:

```js
puppeteer.executablePath()
```

and then we explicitly execute:

```text
pnpm exec puppeteer browsers install chrome
```

### One important change from the previous fix

Your current installation log says:

```text
+ puppeteer 24.43.1
```

So the dependency installation is working correctly.

The next build should therefore get past:

```text
pnpm install
```

and:

```text
node ./ensure-browser.mjs
```

If Chrome isn't present, we should then finally see the **actual Puppeteer download/install error**, rather than another JavaScript parser error.

### Don't change these yet

Keep:

```json
"puppeteer": "24.43.1"
```

Keep your existing `package.json`.

Don't upgrade pnpm.

Don't upgrade TypeScript.

Don't run `pnpm approve-builds`.

Don't change the Orval dependencies.

Those aren't stopping this deployment.

**The next deployment is the important test.** If this script reaches `Installing Puppeteer Chrome...` and then fails, paste everything from that point onward. That will tell us whether the remaining issue is Chrome download access, the Puppeteer cache, or the deployment environment itself.
