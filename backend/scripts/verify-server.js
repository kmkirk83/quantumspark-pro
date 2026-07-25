const { accessSync } = require("node:fs");

const requiredFiles = [
  "app.js",
  "server.js",
  "src/config.js",
  "src/routes/auth.js",
  "src/routes/billing.js",
  "src/routes/market.js",
  "src/routes/webhook.js",
];

try {
  requiredFiles.forEach((file) => accessSync(file));
} catch (error) {
  console.error(`Missing required backend source file: ${error.path}`);
  process.exit(1);
}

console.log("Backend source verified.");
