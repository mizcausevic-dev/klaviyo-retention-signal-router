import { mkdir, writeFile } from "node:fs/promises";
import sample from "../fixtures/klaviyo-retention-sample.json" with { type: "json" };
import { buildConsole, type RetentionInput } from "../src/index.js";

const retentionConsole = buildConsole(sample as RetentionInput);
const strongest = [...retentionConsole.lanes].sort((a, b) => b.retentionSignalScore - a.retentionSignalScore)[0];
const weakest = retentionConsole.lanes[0];
const revenueAtRisk = retentionConsole.lanes.reduce((sum, lane) => sum + lane.revenueAtRiskUsd, 0);

const cards = retentionConsole.lanes
  .map(
    (lane) => `<article class="card">
      <span>${lane.tier}</span>
      <h3>${lane.name}</h3>
      <p>${lane.routingNote}</p>
      <dl>
        <div><dt>Owner</dt><dd>${lane.owner}</dd></div>
        <div><dt>Flow</dt><dd>${lane.primaryFlow}</dd></div>
        <div><dt>Signal</dt><dd>${lane.retentionSignalScore}</dd></div>
        <div><dt>Revenue at risk</dt><dd>$${lane.revenueAtRiskUsd.toLocaleString()}</dd></div>
      </dl>
    </article>`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Klaviyo Retention Signal Router</title>
    <meta name="description" content="Board-readable Klaviyo retention signal router for lifecycle fatigue, consent coverage, revenue recovery, and next actions." />
    <style>
      :root {
        --bg: #050912;
        --panel: #0c1523;
        --panel-2: #101c2d;
        --line: rgba(116, 241, 219, 0.24);
        --text: #f6f3ea;
        --muted: #aeb7c7;
        --cyan: #30d5ff;
        --mint: #65f0c4;
        --pink: #ff7ac8;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background:
          radial-gradient(circle at top left, rgba(48,213,255,.16), transparent 34rem),
          radial-gradient(circle at top right, rgba(255,122,200,.14), transparent 32rem),
          var(--bg);
        color: var(--text);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0 56px; }
      .hero {
        border: 1px solid var(--line);
        border-radius: 28px;
        padding: clamp(28px, 6vw, 64px);
        background: linear-gradient(135deg, rgba(16,28,45,.96), rgba(8,13,24,.9));
        box-shadow: 0 30px 90px rgba(0,0,0,.35);
      }
      .eyebrow {
        color: var(--mint);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        letter-spacing: .22em;
        text-transform: uppercase;
      }
      h1 {
        margin: 18px 0;
        max-width: 880px;
        font-size: clamp(46px, 8vw, 104px);
        line-height: .92;
        letter-spacing: -.065em;
      }
      .lede { max-width: 740px; color: var(--muted); font-size: clamp(18px, 2.4vw, 24px); line-height: 1.55; }
      .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 34px; }
      .metric, .card, .recommendation {
        border: 1px solid rgba(255,255,255,.1);
        background: rgba(16,28,45,.72);
        border-radius: 20px;
      }
      .metric { padding: 20px; }
      .metric strong { display: block; font-size: 34px; letter-spacing: -.04em; }
      .metric span { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .12em; }
      h2 { font-size: clamp(34px, 5vw, 62px); letter-spacing: -.05em; margin: 46px 0 16px; }
      .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
      .card { padding: 24px; min-height: 260px; }
      .card span { color: var(--cyan); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; letter-spacing: .16em; }
      .card h3 { margin: 14px 0; font-size: 26px; letter-spacing: -.035em; }
      .card p { color: var(--muted); line-height: 1.55; }
      dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 22px 0 0; }
      dt { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .12em; }
      dd { margin: 4px 0 0; font-weight: 700; }
      .recommendation { margin-top: 18px; padding: 26px; border-left: 4px solid var(--mint); }
      .recommendation strong { color: var(--mint); }
      footer { color: var(--muted); margin-top: 32px; font-size: 14px; }
      a { color: var(--cyan); }
      @media (max-width: 820px) {
        .metrics, .grid { grid-template-columns: 1fr; }
        dl { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="eyebrow">Lifecycle revenue operations</div>
        <h1>Retention signals should route revenue recovery before flow fatigue becomes churn.</h1>
        <p class="lede">Klaviyo Retention Signal Router turns consent coverage, lifecycle readiness, campaign collisions, and suppressed-profile pressure into one board-readable next-action surface.</p>
        <div class="metrics">
          <div class="metric"><strong>${retentionConsole.lanes.length}</strong><span>Lanes modeled</span></div>
          <div class="metric"><strong>$${Math.round(revenueAtRisk / 1000)}K</strong><span>Revenue at risk</span></div>
          <div class="metric"><strong>${weakest.retentionSignalScore}</strong><span>Weakest signal</span></div>
          <div class="metric"><strong>${strongest.retentionSignalScore}</strong><span>Strongest signal</span></div>
        </div>
      </section>
      <h2>Lifecycle lanes</h2>
      <section class="grid">${cards}</section>
      <section class="recommendation">
        <strong>Primary recommendation</strong>
        <p>${retentionConsole.primaryRecommendation}</p>
      </section>
  
    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-kicker">Executive intelligence product</div>
          <h2>What this does</h2>
        </div>
        <p class="summary">This product helps marketing, revenue, and lifecycle teams see which retention signals need action before list fatigue, broken segmentation, or missed revenue motion compounds.</p>
      </div>
      <div class="grid three">
        <article class="card"><div class="top"><span>GTM analyst lens</span></div><h3>Connects the signal to a commercial decision.</h3><p>Makes lifecycle marketing operationally credible by tying segments, flows, suppression, offers, and attribution to a clear next action.</p></article>
        <article class="card"><div class="top"><span>SaaS value lens</span></div><h3>Turns operational noise into investable remediation.</h3><p>Frames campaign and flow cleanup as revenue protection, churn reduction, and cleaner customer journeys instead of just email ops hygiene.</p></article>
        <article class="card"><div class="top"><span>Technical proof</span></div><h3>Keeps the calculation inspectable and safe.</h3><p>Scores retention lanes using segment freshness, flow health, attribution readiness, suppression coverage, deliverability posture, and owner routing.</p></article>
      </div>
      <div class="pill-list" aria-label="Signal tags"><span class="pill">Lifecycle revenue and retention signal routing</span><span class="pill">board-ready evidence</span><span class="pill">owner routing</span><span class="pill">synthetic proof</span></div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-kicker">Operating workflow</div>
          <h2>How the signal becomes a decision</h2>
        </div>
        <p class="summary">The workflow is designed for reusable diligence and operating packets: collect the evidence, score the posture, route the gap, and publish a buyer-readable next action.</p>
      </div>
      <div class="workflow">
        <div class="step"><strong>1</strong><div><h3>Register signal lane and segment owner</h3><p>Attach the responsible owner, audience, system lane, and decision context before the lifecycle revenue and retention signal routing signal reaches an executive packet.</p></div></div>
        <div class="step"><strong>2</strong><div><h3>Score flow, audience, and attribution health</h3><p>Use the typed engine to turn raw operating evidence into a comparable posture that leaders can inspect without needing console access.</p></div></div>
        <div class="step"><strong>3</strong><div><h3>Route cleanup by revenue impact</h3><p>Turn the score into a concrete remediation motion with a named owner, urgency tier, and business consequence.</p></div></div>
        <div class="step"><strong>4</strong><div><h3>Publish retention action plan</h3><p>Expose the executive-safe story: current posture, risk, recoverable value, and what should happen next.</p></div></div>
      </div>
    </section>

    <section class="section boundary">
      <div class="section-kicker">What these repos have in common</div>
      <h2>They convert platform complexity into board-ready operating proof.</h2>
      <p class="summary">The public surface uses synthetic Klaviyo retention data only. No customer profiles, lists, events, revenue exports, API keys, or credentials belong in this repo. The shared Kinetic Gain pattern is consistent: name the buyer pain, expose the evidence trail, produce a reusable artifact, and keep the public surface safe to review.</p>
    </section>
    <footer><span>Klaviyo Retention Signal Router</span><span>·</span><a href="https://portfolio.kineticgain.com/">Portfolio</a><a href="https://kineticgain.com/">Kinetic Gain</a><a href="https://github.com/mizcausevic-dev/klaviyo-retention-signal-router">GitHub</a></footer>
    </main>
  </body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
