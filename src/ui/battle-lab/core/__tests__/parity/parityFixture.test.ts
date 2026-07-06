// Cross-language parity fixture: the single source of truth that the C# port
// (unity-port/BattleCore.Tests/ParityTests.cs) replays under FixedRng(0).
//
// Two modes, one file:
//   • Default `vitest run`  -> asserts the live TS core still reproduces the
//     committed fixture byte-for-byte. This is the TS-SIDE DRIFT GUARD: change
//     the core logic without regenerating and this test fails.
//   • PARITY_WRITE=1        -> regenerates the fixture from the live TS core.
//     Driven by `npm run parity:gen` (see unity-port/tools/gen-parity.mjs).
//
// The fixture pins Math.random() to 0 so the shuffle is deterministic and the
// C# FixedRng(0) run matches step-for-step. The SCENARIO below is the canonical
// battle trace (a full loss, then a RESTART and two more actions) — edit it here
// if you want the parity coverage to exercise more of the state machine.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { BattleAction, BattleState } from "../../types";
import { battleReducer, initState } from "../../battleReducer";

const FIXTURE_PATH = resolve(
  process.cwd(),
  "unity-port/BattleCore.Tests/Fixtures/parity-fixture.json",
);

const WRITE = process.env.PARITY_WRITE === "1";

/** Marker for the INIT snapshot; not a real dispatchable action. */
type FixtureAction = BattleAction | { readonly type: "INIT" };

interface FixtureStep {
  readonly action: FixtureAction;
  readonly state: BattleState;
}

// The canonical action trace (indices 1.. after the INIT snapshot). Instance ids
// are stable because the shuffle is pinned to Math.random() === 0.
const SCENARIO: readonly BattleAction[] = [
  { type: "PLAY_CARD", instanceId: "thrust-1" },
  { type: "END_TURN" },
  { type: "PLAY_CARD", instanceId: "step_in-0" },
  { type: "END_TURN" },
  { type: "PLAY_CARD", instanceId: "step_in-1" },
  { type: "END_TURN" },
  { type: "PLAY_CARD", instanceId: "thrust-0" },
  { type: "PLAY_CARD", instanceId: "brace-0" },
  { type: "END_TURN" },
  { type: "END_TURN" },
  { type: "PLAY_CARD", instanceId: "feint-0" },
  { type: "END_TURN" },
  { type: "END_TURN" },
  { type: "END_TURN" },
  { type: "END_TURN" },
  { type: "END_TURN" },
  { type: "END_TURN" },
  { type: "END_TURN" },
  { type: "RESTART" },
  { type: "PLAY_CARD", instanceId: "thrust-1" },
  { type: "END_TURN" },
];

function buildFixture(): FixtureStep[] {
  const steps: FixtureStep[] = [];
  let state = initState();
  steps.push({ action: { type: "INIT" }, state });
  for (const action of SCENARIO) {
    state = battleReducer(state, action);
    steps.push({ action, state });
  }
  return steps;
}

describe("TS↔C# parity fixture", () => {
  let built: FixtureStep[];

  beforeAll(() => {
    // Pin the RNG exactly like the C# FixedRng(0) run.
    vi.spyOn(Math, "random").mockReturnValue(0);
    built = buildFixture();
    vi.restoreAllMocks();
  });

  it(
    WRITE
      ? "regenerates the C# parity fixture from the live TS core"
      : "matches the committed C# parity fixture (TS-side drift guard)",
    () => {
      // 2-space indent, no trailing newline: matches the committed blob so a
      // no-op regeneration leaves `git status` clean.
      const serialized = JSON.stringify(built, null, 2);

      if (WRITE) {
        writeFileSync(FIXTURE_PATH, serialized, "utf8");
        expect(built.length).toBe(SCENARIO.length + 1);
        return;
      }

      const committed = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"));
      expect(built).toEqual(committed);
    },
  );
});
