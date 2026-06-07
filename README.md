# klaviyo-retention-signal-router

[![ci](https://github.com/mizcausevic-dev/klaviyo-retention-signal-router/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/klaviyo-retention-signal-router/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/klaviyo-retention-signal-router/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/klaviyo-retention-signal-router/actions/workflows/pages.yml)

Board-readable Klaviyo retention signal router for lifecycle fatigue, consent coverage, revenue recovery, and next actions.

## Why this exists

- Retention programs break down when flow fatigue, consent gaps, stale segments, and promotion collisions are tracked in separate exports.
- Lifecycle, revenue operations, and e-commerce teams need one routing view before send pressure turns into churn or suppressed-profile waste.
- This repo turns synthetic Klaviyo-style lifecycle evidence into an operator surface for revenue recovery, consent hygiene, and campaign sequencing.

## What it shows

- `retentionSignalScore` scoring across consent coverage, revenue recovery coverage, lifecycle readiness, measurement confidence, flow fatigue, suppression rate, stale segments, and campaign collision risk
- lane-level routing notes for replenishment, winback, VIP, and browse-abandonment motions
- CLI output suitable for README packaging and executive proof packets
- static GitHub Pages proof surface with no customer data or Klaviyo credentials

## Local run

```bash
npm install
npm run verify
```

## CLI

```bash
npm run build
node dist/bin/cli.js fixtures/klaviyo-retention-sample.json --format markdown
node dist/bin/cli.js fixtures/klaviyo-retention-sample.json --format json
```

## Proof page

```bash
npm run prerender
```

The generated proof page is written to `site/index.html` for GitHub Pages deployment.

## Data safety

This repository uses synthetic lifecycle metadata only. Do not commit customer profiles, email addresses, phone numbers, consent records, campaign exports, revenue exports, API keys, screenshots, or production Klaviyo evidence.
