#!/usr/bin/env node
// One command to prove the C# port still matches the TypeScript core.
//
//   [1] Regenerate the parity fixture from the live TS core.
//   [2] Report whether the fixture drifted (TS-side behaviour change signal).
//   [3] Run the C# unit + parity tests against the fixture (C#-side signal).
//
// Read the two signals together:
//   • step [2] answers "did the TS core change since the last commit?"
//   • step [3] answers "does the C# port reproduce the current TS core?"
//
// Usage:  npm run parity:check   (or:  node unity-port/tools/parity-check.mjs)

import { spawnSync } from "node:child_process";

const FIXTURE = "unity-port/BattleCore.Tests/Fixtures/parity-fixture.json";

function sh(cmd) {
  return spawnSync(cmd, { stdio: "inherit", shell: true });
}
function capture(cmd) {
  return spawnSync(cmd, { shell: true, encoding: "utf8" });
}

console.log("\n[1/3] Regenerating parity fixture from the live TS core...");
const gen = sh("node unity-port/tools/gen-parity.mjs");
if ((gen.status ?? 1) !== 0) {
  console.error("✗ Fixture regeneration failed (the TS core did not run).");
  process.exit(gen.status ?? 1);
}

console.log("\n[2/3] Checking for TS-side drift in the fixture...");
// Compare against HEAD (the last commit) so the baseline matches the stated
// contract regardless of whether the fixture is staged. `git diff HEAD` still
// respects .gitattributes/autocrlf normalization, so a line-ending-only rewrite
// is NOT reported as drift (exit 0 = no diff, 1 = diff).
const drifted = (capture(`git diff --quiet HEAD -- ${FIXTURE}`).status ?? 0) !== 0;
if (drifted) {
  console.log(
    "⚠ Fixture changed — the TS core behaviour moved since the last commit. Review:",
  );
  sh(`git --no-pager diff HEAD -- ${FIXTURE}`);
  console.log(
    "  If this change is intentional, commit the refreshed fixture. If not, revert the TS core.",
  );
} else {
  console.log(
    "✓ Fixture unchanged — TS core matches the committed golden trace.",
  );
}

console.log("\n[3/3] Running the C# unit + parity tests...");
const version = capture("dotnet --version");
if ((version.status ?? 1) !== 0) {
  console.error("✗ dotnet SDK not found on PATH. Install it, then re-run:");
  console.error("    winget install Microsoft.DotNet.SDK.10");
  console.error("  (see unity-port/README.md — Windows setup)");
  process.exit(2);
}
const test = sh("dotnet test unity-port/UnityCorePort.slnx");
process.exit(test.status ?? 1);
