# HISTORY-archive.md - 変更履歴アーカイブ

> `HISTORY.md` が 5 件を超えた際に退避した古いエントリ（降順）。最新は `HISTORY.md`。

### 2026-05-17 - .claude ハーネス構造を life-editor 準拠へリファクタ（Phase A-E 完了）

#### 概要

グローバル CLAUDE.md 標準構造との乖離を解消するため、`.claude/` を life-editor 運用に合わせて全面再編。ユーザー確認で「フル移行（git mv 標準化）」「MEMORY/HISTORY へ移行」「プロジェクト固有エージェント作成」の 3 方針を決定。Phase A（ディレクトリ移行）〜 Phase E（課題整理）を 1 セッションで完遂。

#### 変更点

- **Phase A — ディレクトリ移行**: `git mv` で `.claude/code_overview/` → `.claude/docs/code-explanation/`（15 ファイル + サブディレクトリ）、`feature_plans/` の tracked 4 ファイル → `docs/vision/plans/`、untracked PixiJS 4 ファイルは `mv`、`memories/LESSONS_LEARNED.md` → `docs/known-issues/`、`memories/basecamp_consolidation_completed.md` → `archive/`。空ディレクトリ削除
- **クロスリンク一括更新**: 非 worktree の .md 11 ファイルで `.claude/code_overview/`→`.claude/docs/code-explanation/` 等を sed 置換。残存ゼロ確認。`worktrees/` 配下は別 git worktree のため非対象
- **Phase B — 標準インフラ新設**: `docs/vision/core.md`（Vision・設計原則）、`docs/known-issues/INDEX.md`（8 知見カタログ + 脆弱性ガイドへのポインタ）、`MEMORY.md`（進行中/直近完了/予定、旧 TODO バックログを移管）、`HISTORY.md`（本ファイル）を作成。`docs/requirements/` ディレクトリも用意。`docs/INDEX.md` を標準構造 + ゲーム設計書の二層構成に書き換え
- **Phase C — CLAUDE.md 再構成**: §0 Meta（役割/更新規則/タスク運用/関連ドキュメント表）追加、Task Completion Rule を TODO/README → MEMORY/HISTORY モデルへ書き換え、Document System 節新設、References 表を更新。223 行（400 行以下目標を維持）。`TODO.md` を MEMORY.md への薄いポインタへ縮小
- **Phase D — プロジェクト固有エージェント**: `agents-lib/projects/original-card-battle/` に分析特化 3 体作成（`card-battle-balance-auditor` = データ vs 設計書整合 / `card-battle-state-invariant-checker` = Context・React19・不可侵コード・セーブ網羅 / `card-battle-battle-logic-validator` = バトルフェーズ・ダメージ・バフ整合）。`.claude/agents/` にシンボリックリンク、`AGENT_INDEX.md` に節 + 最終更新追記
- **Phase E — 課題整理**: 脆弱性ガイドを精読し MEMORY.md「予定」を優先度付きで具体化。**ドキュメント不整合を発見**: README は V-EXEC/V-PHASE 系を「2026-02-05 完了」と記載するが、vulnerability-remediation-guide.md の Phase 5 では未修正扱い。最優先で実コード確認・寄せ先決定が必要（MEMORY.md 課題 #1）
- **方針**: タスク管理は TODO.md/README 履歴 → MEMORY.md/HISTORY.md へ移行（task-tracker 経由運用）。README の Development History は完了履歴の要約として継続

#### 次

MEMORY.md 課題 #1（README vs 脆弱性ガイドの V-EXEC/V-PHASE 不整合）を `card-battle-battle-logic-validator` で検証し寄せ先決定。未コミット（ユーザー確認後に commit 予定）。
