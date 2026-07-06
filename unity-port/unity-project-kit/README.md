# Unity Project Kit — drop-in scaffolding for the real Unity project

This folder holds the **Unity-specific glue** for Phase 3 (the real Unity
project + UGUI battle screen). It does _not_ duplicate the battle core — that
lives once in `unity-port/BattleCore/*.cs` and is proven by `dotnet test`. Here
you get only the pieces a Unity project needs on top of that pure C#: assembly
definitions, a `.gitignore`, and a MonoBehaviour View skeleton already wired to
the store.

> Everything a human must do in the Unity Editor is called out with **[Editor]**.
> Everything else Claude can prepare as plain files (this kit).

## Layout

```
unity-project-kit/
├── unity.gitignore                    → rename to .gitignore at the Unity project root
└── Assets/
    ├── Core/BattleCore.asmdef          engine-free assembly for the ported core
    ├── Tests/BattleCore.Tests.asmdef   EditMode test assembly (NUnit)
    └── View/BattleScreenView.cs        MonoBehaviour skeleton (implements IBattleView)
```

## Steps

### 1. [Editor] Create the Unity project

- Install **Unity Hub**, then **Unity 6 (LTS)** via the Hub (tick the Windows
  Build Support module).
- Create a new project with the **2D (Built-In Render Pipeline)** template.
- Recommended repo layout: a **separate git repo** for the Unity project (the
  Web repo stays as the parity baseline). See the parent plan for the rationale.

### 2. Copy the ported core into `Assets/`

- Copy `unity-port/BattleCore/*.cs` → `Assets/Core/` (next to `BattleCore.asmdef`).
- Copy `unity-port/BattleCore.Tests/*.cs` → `Assets/Tests/` (next to
  `BattleCore.Tests.asmdef`), plus `Fixtures/parity-fixture.json`.
- Copy `Assets/View/BattleScreenView.cs` as-is.

### 3. Rename the gitignore

- `unity.gitignore` → `.gitignore` at the Unity project root.

### 4. [Editor] Wire the scene (this is Phase 3)

- Create a scene, add an empty GameObject, attach `BattleScreenView`.
- Press Play: the stub `Render` logs each state change to the Console — proof the
  store → view loop runs. Then build the real UGUI (HP/stamina/guard panels, the
  hand as clickable cards calling `OnCardClicked`, the log, the result overlay).
- Distance is shown as **real on-screen spacing + posture sprites**, not a
  tab/track (2026-07-04 decision). `ViewModel.DistanceLabel` still gives the text.

## Caveats when the core lands in Unity

- **NUnit version.** The headless lib targets NUnit 4; Unity's Test Framework
  bundles NUnit 3.x. The tests only use the constraint model
  (`Assert.That(x, Is.EqualTo(y))`), which is stable across both, so they should
  compile unchanged. If a NUnit-4-only API sneaks in later, adjust it.
- **`IsExternalInit.cs`.** It is a polyfill so `record`/`init` compile on
  netstandard2.1. Some Unity 6 versions now ship this type themselves — if you
  get a _duplicate definition_ error for `IsExternalInit`, just delete
  `Assets/Core/IsExternalInit.cs`.
- **Parity fixture path.** `ParityTests.cs` loads the fixture via
  `AppContext.BaseDirectory`, which differs under Unity's test runner. Parity is
  already proven by the headless `dotnet test`, so `ParityTests` is optional in
  Unity; if you want it there, load the JSON via a `TextAsset` instead.
- **Don't hand-edit scene/prefab YAML.** GUID/fileID references break easily.
  Do placement and reference wiring in the Editor (or via Unity MCP with a
  read-only-first, confirm-before-write posture). See `../PHASE3-KICKOFF.md`.
