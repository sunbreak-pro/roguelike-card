# Phase 3 Kickoff — Windows setup + UGUI battle screen

Everything Claude could prepare without the Unity Editor is done: the battle core
is ported (`BattleCore/`), proven against the TS core (`dotnet test`, 58/58), and
now has a Logic layer (`BattleStore`), a View contract (`IBattleView` /
`BattleViewModel`), a drop-in `unity-project-kit/`, and a one-command parity
check (`npm run parity:check`).

**Phase 3 is the part that needs a human in the Unity Editor.** This file is the
"do it top to bottom" runbook for **this Windows 11 machine** (the confirmed
development machine). Role split throughout:

- **[human]** — Editor GUI: project creation, scene/prefab placement, reference
  wiring, "does it feel right" checks.
- **[Claude]** — C# logic/tests/data, this repo's files.
- **[MCP]** — optional bridge that lets Claude do some Editor actions; start
  read-only + confirm-before-write.

---

## 0. Prerequisites on this machine

Already present (verified 2026-07-05): **node v24 / npm 11**, **NVIDIA GPU**
(good for Unity + later local AI art). Missing: **dotnet SDK**.

### 0a. [human] Install the .NET SDK (for the headless parity loop)

```powershell
winget install Microsoft.DotNet.SDK.10
```

Reopen the terminal, then confirm the whole cross-language loop runs here:

```powershell
npm install            # if node_modules is missing
npm run parity:check   # regenerates the TS fixture, then runs the C# tests
```

Expected: the fixture is unchanged (TS matches golden) and `dotnet test` reports
**58/58** green (49 unit + 8 BattleStore/View + 1 parity). This is the proof the foundation works
end-to-end on Windows before any Unity work starts.

---

## 1. [human] Unity itself

1. Install **Unity Hub**.
2. From the Hub install **Unity 6 (LTS)** — tick **Windows Build Support**.
3. Create a **2D (Built-In)** project. Recommended: a **separate git repo** for
   the Unity project (this Web repo stays as the parity baseline; clone it next
   to the Unity repo so both live on this machine).
4. Follow `unity-project-kit/README.md` to drop in the core, tests, asmdefs,
   View skeleton, and `.gitignore`.

At this point (no MCP yet) Claude can already write/adjust C# and you can run
EditMode tests from the Editor. **MCP is only needed for Editor automation.**

---

## 2. [human] Claude Code on Windows

Native Windows Claude Code is already in use (this session). C# file editing and
`dotnet test` work exactly as now. Nothing extra needed for Phases 1–2 work.

---

## 3. [human + Claude] Unity MCP (optional, for Editor automation)

MCP lets Claude create GameObjects, add components, read Console errors, and run
EditMode tests from inside Unity. It is **developing fast and flaky** — adopt it
read-only first, keep a confirm-before-write gate, and keep Unity open while it
runs (the bridge lives inside the Editor).

### Implementation choice (research 2026-07-05, confidence: medium)

| Implementation                          | License    | Unity 6                  | Notes for this machine                                                                                                                                                                                                |
| --------------------------------------- | ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IvanMurzak/Unity-MCP**                | Apache-2.0 | ✅                       | Most active (frequent releases), 70+ tools, **auto-reconnects after domain reload** (the main Windows pain). Hard rule: **no spaces in the project path** — ours (`C:\Users\user\orca\original-card-battle`) is fine. |
| **CoplayDev/unity-mcp**                 | MIT        | ✅ (2021.3→6.x explicit) | Has a dedicated **Claude Code guide**; very active (v10, 2026-06). Needs Python 3.10+ (uv). Most-reported Windows domain-reload disconnects (partly visibility bias).                                                 |
| **CoderGamester/mcp-unity**             | MIT        | ✅                       | Solid tool coverage; WSL2 split setups hit localhost/ECONNREFUSED issues.                                                                                                                                             |
| Unity official `com.unity.ai.assistant` | Unity      | ✅ (6+)                  | Still **preview (`-pre`)** and **requires a paid/Cloud-linked subscription** → skip for low-cost solo dev.                                                                                                            |

**Recommended start:** **IvanMurzak/Unity-MCP** (auto-reconnect on domain reload
is the biggest Windows quality-of-life win, and our path has no spaces), with
**CoplayDev/unity-mcp** as the fallback if you want the ready-made Claude Code
guide. This space moves monthly — re-check both READMEs at adoption time.

### 3a. [human] Add the package in Unity

Package Manager → _Add package from git URL_ → the chosen repo's UPM URL (see its
README). Keep Unity open.

### 3b. [human] Register the server with Claude Code

Prefer the implementation's **in-Editor "Configure / Integrations" button**,
which generates the exact `claude mcp add …` line for your install — the
hand-written commands floating around go stale. (For reference, CoplayDev
currently documents a `claude mcp add --scope user --transport stdio … uvx …
coplay-mcp-server@latest` form — verify it against the in-Editor generator before
trusting it.)

### 3c. [human] Smoke test

With Unity open, ask Claude to "list the GameObjects in the current scene" or
"run one EditMode test". A sensible reply = the bridge is connected.

---

## 4. [human + Claude] Build the battle screen

The wiring already compiles (`BattleScreenView` → `BattleStore` → `IBattleView`).
Phase 3 is filling in `Render`:

- both-side panels: HP / stamina / guard,
- distance as **real on-screen spacing + posture sprites** (2026-07-04 decision;
  `ViewModel.DistanceLabel` still supplies the text),
- hand from `vm.Hand` → clickable cards → `OnCardClicked(instanceId)`,
- End Turn / Restart buttons → `OnEndTurnClicked` / `OnRestartClicked`,
- log (newest first) and a result overlay when `vm.BattleOver`.

**Acceptance:** play one battle to a win/loss and restart, with a fixed seed
(`new FixedRng(0)`) matching the Web trace. Then unpin the RNG for real play.

---

## Guardrails (carry over from the plan)

- Keep MonoBehaviours thin; logic stays in the engine-free `BattleCore` assembly
  (`noEngineReferences: true` enforces it).
- Scope is **core + one battle**. No art/Live2D, no full card/enemy roster, no
  new combat systems (sword-energy / stagger), no 3D, no distribution yet.
- Don't hand-edit scene/prefab YAML — GUID/fileID references break.
- When the TS core changes, run `npm run parity:check` before trusting the port.
