"use strict";

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const distPath = path.join(projectRoot, "dist");
const sourcePath = path.join(projectRoot, "src");

for (const file of ["index.html", "kota-order.css", "kota-order.js"]) {
  fs.copyFileSync(path.join(sourcePath, file), path.join(distPath, file));
}

fs.cpSync(
  path.join(projectRoot, "images"),
  path.join(distPath, "images"),
  { recursive: true }
);
