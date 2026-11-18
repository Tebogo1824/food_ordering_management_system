"use strict";

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const distPath = path.resolve(projectRoot, "dist");

if (!distPath.startsWith(`${projectRoot}${path.sep}`)) {
  throw new Error("Build output must be inside the project directory.");
}

fs.rmSync(distPath, { recursive: true, force: true });
fs.mkdirSync(distPath, { recursive: true });
