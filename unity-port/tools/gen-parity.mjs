#!/usr/bin/env node
// Regenerate the cross-language parity fixture from the LIVE TypeScript core.
//
// Sets PARITY_WRITE=1 and runs only the parity test, which writes
// unity-port/BattleCore.Tests/Fixtures/parity-fixture.json. Cross-platform
// (Windows / macOS / Linux) via a shell child process.
//
// Usage:  npm run parity:gen      (or:  node unity-port/tools/gen-parity.mjs)

import { spawnSync } from "node:child_process";

const TEST_PATH =
  "src/ui/battle-lab/core/__tests__/parity/parityFixture.test.ts";

const result = spawnSync(`npx vitest run ${TEST_PATH}`, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PARITY_WRITE: "1" },
});

process.exit(result.status ?? 1);
