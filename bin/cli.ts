#!/usr/bin/env node
import { loadConsole, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: klaviyo-retention-signal-router <input.json> [--format markdown|json]");
  process.exit(1);
}

const retentionConsole = await loadConsole(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(retentionConsole, null, 2) : renderMarkdown(retentionConsole));
