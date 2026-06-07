import { describe, expect, it } from "vitest";
import { buildConsole, classifyTier, renderMarkdown, type RetentionInput } from "../src/index.js";
import sample from "../fixtures/klaviyo-retention-sample.json" with { type: "json" };

describe("klaviyo retention signal router", () => {
  it("classifies retention tiers", () => {
    expect(classifyTier(51)).toBe("ESCALATE");
    expect(classifyTier(66)).toBe("ROUTE");
    expect(classifyTier(80)).toBe("WATCH");
    expect(classifyTier(91)).toBe("HEALTHY");
  });

  it("scores the weakest lane with routing language", () => {
    const console = buildConsole(sample as RetentionInput);
    expect(console.lanes[0]?.name).toBe("Post-purchase replenishment");
    expect(console.lanes[0]?.retentionSignalScore).toBeLessThan(60);
    expect(console.lanes[0]?.routingNote).toContain("retention signal routing");
  });

  it("sorts lanes by weakest signal first", () => {
    const console = buildConsole(sample as RetentionInput);
    const scores = console.lanes.map((lane) => lane.retentionSignalScore);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it("renders markdown with revenue-at-risk evidence", () => {
    const markdown = renderMarkdown(buildConsole(sample as RetentionInput));
    expect(markdown).toContain("Klaviyo Retention Signal Router");
    expect(markdown).toContain("Post-purchase replenishment");
    expect(markdown).toContain("$184,000");
  });
});
