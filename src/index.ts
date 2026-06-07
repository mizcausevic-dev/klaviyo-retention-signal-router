import { readFile } from "node:fs/promises";

export type RetentionTier = "HEALTHY" | "WATCH" | "ROUTE" | "ESCALATE";

export interface RetentionLane {
  name: string;
  owner: string;
  audience: string;
  primaryFlow: string;
  flowFatigueScore: number;
  consentCoverage: number;
  revenueRecoveryCoverage: number;
  lifecycleReadiness: number;
  measurementConfidence: number;
  suppressedProfileRate: number;
  staleSegmentCount: number;
  campaignCollisionRisk: number;
  revenueAtRiskUsd: number;
  nextAction: string;
}

export interface RetentionInput {
  organization: string;
  generatedAt: string;
  lanes: RetentionLane[];
}

export interface ScoredRetentionLane extends RetentionLane {
  retentionSignalScore: number;
  tier: RetentionTier;
  routingNote: string;
}

export interface RetentionConsole {
  organization: string;
  generatedAt: string;
  primaryRecommendation: string;
  lanes: ScoredRetentionLane[];
}

export function classifyTier(retentionSignalScore: number): RetentionTier {
  if (retentionSignalScore < 60) return "ESCALATE";
  if (retentionSignalScore < 72) return "ROUTE";
  if (retentionSignalScore < 84) return "WATCH";
  return "HEALTHY";
}

export function scoreLane(lane: RetentionLane): ScoredRetentionLane {
  const positive =
    lane.consentCoverage * 0.22 +
    lane.revenueRecoveryCoverage * 0.24 +
    lane.lifecycleReadiness * 0.2 +
    lane.measurementConfidence * 0.18 +
    (100 - lane.flowFatigueScore) * 0.16;
  const penalty =
    lane.suppressedProfileRate * 0.2 +
    lane.staleSegmentCount * 1.3 +
    lane.campaignCollisionRisk * 0.18;
  const retentionSignalScore = Math.max(0, Math.min(100, Math.round(positive - penalty)));
  const tier = classifyTier(retentionSignalScore);
  const routingNote =
    tier === "ESCALATE"
      ? `${lane.name} needs immediate retention signal routing before revenue recovery and consent gaps compound.`
      : tier === "ROUTE"
        ? `${lane.name} should be routed into a lifecycle cleanup packet with consent, suppression, and flow-collision evidence.`
        : tier === "WATCH"
          ? `${lane.name} is usable, but fatigue and measurement evidence should be reviewed before the next lifecycle push.`
          : `${lane.name} is healthy enough for standard retention monitoring.`;
  return { ...lane, retentionSignalScore, tier, routingNote };
}

export function buildConsole(input: RetentionInput): RetentionConsole {
  const lanes = input.lanes.map(scoreLane).sort((a, b) => a.retentionSignalScore - b.retentionSignalScore);
  const weakest = lanes[0];
  return {
    organization: input.organization,
    generatedAt: input.generatedAt,
    primaryRecommendation: `Fix ${weakest.name} first; it has the weakest Klaviyo retention-signal posture.`,
    lanes
  };
}

export async function loadConsole(path: string): Promise<RetentionConsole> {
  const raw = await readFile(path, "utf8");
  return buildConsole(JSON.parse(raw) as RetentionInput);
}

export function renderMarkdown(retentionConsole: RetentionConsole): string {
  const rows = retentionConsole.lanes
    .map(
      (lane) =>
        `| ${lane.name} | ${lane.tier} | ${lane.retentionSignalScore} | ${lane.primaryFlow} | ${lane.consentCoverage}% | $${lane.revenueAtRiskUsd.toLocaleString()} | ${lane.nextAction} |`
    )
    .join("\n");
  return `# Klaviyo Retention Signal Router

Organization: ${retentionConsole.organization}

Primary recommendation: ${retentionConsole.primaryRecommendation}

| Lane | Tier | Retention signal | Primary flow | Consent coverage | Revenue at risk | Next action |
| --- | --- | ---: | --- | ---: | ---: | --- |
${rows}
`;
}
