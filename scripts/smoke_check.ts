import { readFileSync } from "node:fs";

const html = readFileSync("site/index.html", "utf8");
const requiredMarkers = [
  "Klaviyo Retention Signal Router",
  "Retention signals should route revenue recovery",
  "Post-purchase replenishment",
  "Primary recommendation"
];

for (const marker of requiredMarkers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing prerender marker: ${marker}`);
  }
}

console.log("smoke ok");
