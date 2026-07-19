import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["public", "tests"];
const allowedExtensions = new Set([".js", ".mjs"]);

function collectFiles(directory) {
    return readdirSync(directory).flatMap((entry) => {
        const fullPath = join(directory, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            return collectFiles(fullPath);
        }

        return allowedExtensions.has(fullPath.slice(fullPath.lastIndexOf("."))) ? [fullPath] : [];
    });
}

for (const file of roots.flatMap(collectFiles)) {
    const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}
