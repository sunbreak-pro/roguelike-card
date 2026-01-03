/**
 * enemy action execution logic
 * Battle System Ver 4.0
 */

import type { Enemy, EnemyAction } from "../../Character/data/EnemyData";
import { determineEnemyAction } from "./enemyAI";

/**
 * @param enemy enemy data
 * @param enemyHp enemy's current HP
 * @param enemyMaxHp enemy's max HP
 * @param turn current turn number
 * @param enemyEnergy enemy's action energy for this turn
 * @param onExecuteAction callback when executing an action
 * @param checkBattleEnd function to check if the battle has ended
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
      const fallbackAction = getFallbackAction(remainingEnergy);
      if (fallbackAction) {
        actionsToExecute.push(fallbackAction);
      }
      break;
    }

    actionsToExecute.push(action);
    remainingEnergy -= actionCost;
  }

  // Execute actions sequentially (with animations)
  for (let i = 0; i < actionsToExecute.length; i++) {
    // Check if battle has ended (pre-check)
    if (checkBattleEnd()) {
      break;
    }

    await onExecuteAction(actionsToExecute[i]);

    // Delay between actions (no delay after the last action)
    if (i < actionsToExecute.length - 1) {
      await delay(800);
    }

    // Check if battle has ended (post-check)
    if (checkBattleEnd()) {
      break;
    }
  }
}

/**
 * Fallback action when energy is insufficient
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
  return null;
}

/**
 * delay helper function
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Preview enemy actions for the next turn
 * UI display
 */
export function previewEnemyActions(
  enemy: Enemy,
  currentHp: number,
  nextTurn: number
): EnemyAction[] {
  const totalEnergy = enemy.actEnergy;
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
