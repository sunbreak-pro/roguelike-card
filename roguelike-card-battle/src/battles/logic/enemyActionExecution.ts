/**
 * 敵の行動実行ロジック
 * Battle System Ver 4.0
 */

import type { Enemy, EnemyAction } from "../../Character/data/EnemyData";
import { determineEnemyAction } from "./enemyAI";

/**
 * 敵のエナジー分の行動を実行
 *
 * @param enemy 敵データ
 * @param enemyHp 敵の現在HP
 * @param enemyMaxHp 敵の最大HP
 * @param turn 現在のターン数
 * @param enemyEnergy 敵のエナジー（行動回数）
 * @param onExecuteAction 行動実行時のコールバック
 * @param checkBattleEnd 戦闘終了チェック関数
 */
export async function executeEnemyActions(
  enemy: Enemy,
  enemyHp: number,
  enemyMaxHp: number,
  turn: number,
  enemyEnergy: number,
  onExecuteAction: (action: EnemyAction) => Promise<void>,
  checkBattleEnd: () => boolean
): Promise<void> {
  let remainingEnergy = enemyEnergy;
  const actionsToExecute: EnemyAction[] = [];

  // エナジーが尽きるまで行動を選択
  while (remainingEnergy > 0) {
    const action = determineEnemyAction(
      enemy,
      enemyHp,
      enemyMaxHp,
      turn,
      remainingEnergy
    );

    const actionCost = action.energyCost ?? 1;

    if (actionCost > remainingEnergy) {
      // エナジー不足なら低コスト行動を選択
      const fallbackAction = getFallbackAction(remainingEnergy);
      if (fallbackAction) {
        actionsToExecute.push(fallbackAction);
      }
      break;
    }

    actionsToExecute.push(action);
    remainingEnergy -= actionCost;
  }

  // 行動を順次実行（アニメーション付き）
  for (let i = 0; i < actionsToExecute.length; i++) {
    // 戦闘終了チェック（事前チェック）
    if (checkBattleEnd()) {
      break;
    }

    await onExecuteAction(actionsToExecute[i]);

    // 行動間のディレイ（最後の行動の後はディレイなし）
    if (i < actionsToExecute.length - 1) {
      await delay(800);
    }

    // 戦闘終了チェック（事後チェック）
    if (checkBattleEnd()) {
      break;
    }
  }
}

/**
 * エナジー不足時のフォールバック行動
 */
function getFallbackAction(remainingEnergy: number): EnemyAction | null {
  if (remainingEnergy >= 1) {
    return {
      name: "基本攻撃",
      type: "attack",
      baseDamage: 5,
      displayIcon: "⚔️",
      priority: 0,
      energyCost: 1,
    };
  }

  // エナジー0の場合は何もしない
  return null;
}

/**
 * ディレイ用ユーティリティ関数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 敵の次のターンの行動を予告
 * UI表示用
 */
export function previewEnemyActions(
  enemy: Enemy,
  currentHp: number,
  nextTurn: number
): EnemyAction[] {
  const totalEnergy = enemy.baseEnemyEnergy;
  const actions: EnemyAction[] = [];
  let remainingEnergy = totalEnergy;

  while (remainingEnergy > 0) {
    const action = determineEnemyAction(
      enemy,
      currentHp,
      enemy.maxHp,
      nextTurn,
      remainingEnergy
    );

    const actionCost = action.energyCost ?? 1;

    if (actionCost > remainingEnergy) {
      const fallbackAction = getFallbackAction(remainingEnergy);
      if (fallbackAction) {
        actions.push(fallbackAction);
      }
      break;
    }

    actions.push(action);
    remainingEnergy -= actionCost;
  }

  return actions;
}
