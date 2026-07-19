import { accessSync } from "node:fs";

[
    "public/index.html",
    "public/mission-control.html",
    "public/dashboard.js",
    "public/mission-control.js"
].forEach((file) => accessSync(file));

console.log("Frontend static assets verified.");
