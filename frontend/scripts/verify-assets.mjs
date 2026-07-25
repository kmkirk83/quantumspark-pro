import { accessSync } from "node:fs";

for (const file of [
    "public/index.html",
    "public/mission-control.html",
    "public/dashboard.js",
    "public/mission-control.js",
    "public/account.html",
    "public/account.js",
    "public/success.html",
    "public/success.js",
    "public/cancel.html",
    "public/lib/api.js",
    "public/lib/session.js"
]) {
    try {
        accessSync(file);
    } catch (error) {
        console.error(`Missing required frontend asset: ${file}`);
        process.exit(1);
    }
}

console.log("Frontend static assets verified.");
