const { accessSync } = require("node:fs");

try {
    accessSync("server.js");
} catch (error) {
    console.error("Missing required backend source file: server.js");
    process.exit(1);
}

console.log("Backend source verified.");
