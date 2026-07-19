const { accessSync } = require("node:fs");

accessSync("server.js");

console.log("Backend source verified.");
