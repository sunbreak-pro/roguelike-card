# Unity Core Port — Battle Core (C#)

検証済みの戦闘コア（TypeScript, `src/ui/battle-lab/core/`）を **Unity Editor 抜きの純 C# クラスライブラリ**として移植し、`dotnet test` で TS 版とのパリティ（同一入力 → 同一出力）を証明するための最小プロジェクトです。Unity 移行の「第一歩」に相当します。

計画の原本: `.claude/docs/vision/plans/2026-06-28-unity-first-step-core-port.md`

## なぜ Web リポのサブフォルダに置いているか

移植元の TS 実装（`src/ui/battle-lab/core/`）を **パリティ検証の基準**として同一リポ内で参照し続けたいためです。別リポに切り出すと、TS 側の変更に C# 側が追従できているかを 1 コミットで確認しづらくなります。専用リポへの分離は将来の判断（未決）とし、まずは同居させています。

## 構造

```
unity-port/
├── UnityCorePort.slnx          ソリューション
├── BattleCore/                 移植した戦闘コア（netstandard2.1 / C# 9）
│   ├── IRng.cs                 乱数の注入口（SystemRng / FixedRng）
│   ├── IsExternalInit.cs       record/init を netstandard2.1 で使うためのポリフィル
│   ├── Types.cs                enum・record・enum↔TS文字列トークン変換
│   ├── Constants.cs            数値定数（TS constants.ts と一致）
│   ├── Combat.cs               間合い・スタミナ・ダメージ計算
│   ├── Cards.cs                デッキ生成・シャッフル・ドロー
│   ├── Enemy.cs                敵 AI と行動解決
│   ├── BattleReducer.cs        状態遷移（Init / PlayCard / EndTurn / Restart）
│   └── ViewModel.cs            UI 表示用の派生ビュー
└── BattleCore.Tests/           NUnit（net10.0）
    ├── CombatTests.cs
    ├── BattleReducerTests.cs
    ├── ViewModelTests.cs
    ├── ParityTests.cs          TS ゴールドデータとのフルトレース照合
    └── Fixtures/
        └── parity-fixture.json TS 実装を FixedRng(0) 相当で走らせた正解データ
```

`BattleCore` は Unity 2021.2+ がそのままコンパイルできる設定（netstandard2.1 / LangVersion 9.0 / ImplicitUsings disable / Nullable enable）で書いています。将来 `Assets/Core/` へコピーしても無改変で通ることを狙っています。

## TS からの意図的な逸脱（数値・ロジックは不変）

数値とロジックは TS と完全一致させています。逸脱は**乱数の扱い 1 点だけ**です。

- **TS**: グローバルな `Math.random()` を `cards.ts` 内で直接呼ぶ（注入なし）。
- **C#**: `IRng`（`double NextDouble()`）を注入する。`SystemRng`（実プレイ用）と `FixedRng`（固定値・既定 0、パリティ用）を用意。
  - `BattleReducer.InitState(IRng rng)` と `BattleReducer.Reduce(BattleState state, BattleAction action, IRng rng)`（**3 引数**）が rng を受け取る。RESTART の再初期化・END_TURN 内の山札切れ時の再シャッフルで rng が要るためです。
  - `PlayCard` は乱数を使わないので内部ヘルパーに rng は渡していません。
- **丸め**: JS の `Math.round` は 0.5 を切り上げる。C# の `Math.Round` は既定が銀行丸め（偶数寄せ）なので、`Math.Round(raw, MidpointRounding.AwayFromZero)` を使って JS 挙動に合わせています（raw は常に非負）。

これ以外の実装補助（`IsExternalInit.cs` のポリフィル、enum ↔ TS 文字列トークンの変換ヘルパー）はロジックに影響しない足回りです。

## 実行

```bash
export DOTNET_ROOT="/opt/homebrew/opt/dotnet/libexec"
export PATH="/opt/homebrew/opt/dotnet/bin:$PATH"
cd /Users/newlife/dev/apps/battle-bakeoff
dotnet test unity-port/UnityCorePort.slnx
```

全テスト（ユニット 49 + パリティ 1 = 50）が green になれば、C# 版が TS 版と同一挙動であることの証明になります。
