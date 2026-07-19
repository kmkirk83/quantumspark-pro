import { accessSync } from "node:fs";

for (const file of [
    "public/index.html",
    "public/mission-control.html",
    "public/dashboard.js",
    "public/mission-control.js"
]) {
    try {
        accessSync(file);
    } catch (error) {
        console.error(`Missing required frontend asset: ${file}`);
        process.exit(1);
    }
}

console.log("Frontend static assets verified.");
