/**
 * 速度計算とターン順序決定
 * Battle System Ver 4.0
 */

import type { BuffDebuffMap } from "../../cards/type/baffType";
import type { Enemy } from "../../Character/data/EnemyData";

export interface SpeedBonus {
  name: "先制" | "電光石火";
  attackBonus: number; // 攻撃力ボーナス（0.15 = 15%）
  criticalBonus: number; // クリティカル率ボーナス（0.2 = 20%）
}

/**
 * Calculate player speed with buffs/debuffs
 */
export function calculatePlayerSpeed(buffs: BuffDebuffMap): number {
  let speed = 50; // Base speed

  // Haste buff (+15 speed)
  if (buffs.has("haste")) {
    const hasteBuff = buffs.get("haste")!;
    speed += hasteBuff.value;
  }

  // SuperFast buff (+30 speed)
  if (buffs.has("superFast")) {
    const superFastBuff = buffs.get("superFast")!;
    speed += superFastBuff.value;
  }

  // Slow debuff (-10 speed)
  if (buffs.has("slow")) {
    const slowDebuff = buffs.get("slow")!;
    speed -= slowDebuff.value;
  }

  // Stall debuff (-15 speed)
  if (buffs.has("stall")) {
    const stallDebuff = buffs.get("stall")!;
    speed -= stallDebuff.value;
  }

  return Math.max(0, speed);
}

/**
 * Calculate enemy speed with buffs/debuffs
 */
export function calculateEnemySpeed(
  enemy: Enemy,
  buffs: BuffDebuffMap
): number {
  let speed = enemy.speed; // Enemy base speed

  // Haste buff (+15 speed)
  if (buffs.has("haste")) {
    const hasteBuff = buffs.get("haste")!;
    speed += hasteBuff.value;
  }

  // SuperFast buff (+30 speed)
  if (buffs.has("superFast")) {
    const superFastBuff = buffs.get("superFast")!;
    speed += superFastBuff.value;
  }

  // Slow debuff (-10 speed)
  if (buffs.has("slow")) {
    const slowDebuff = buffs.get("slow")!;
    speed -= slowDebuff.value;
  }

  // Stall debuff (-15 speed)
  if (buffs.has("stall")) {
    const stallDebuff = buffs.get("stall")!;
    speed -= stallDebuff.value;
  }

  return Math.max(0, speed);
}

/**
 * ターン順序を決定
 * 同速の場合はプレイヤー優先
 */
export function determineTurnOrder(
  playerSpeed: number,
  enemySpeed: number
): "player" | "enemy" {
  return playerSpeed >= enemySpeed ? "player" : "enemy";
}

/**
 * 速度差ボーナスの計算
 */
export function calculateSpeedBonus(
  actorSpeed: number,
  targetSpeed: number
): SpeedBonus | null {
  const speedDiff = actorSpeed - targetSpeed;

  if (speedDiff >= 50) {
    return {
      name: "電光石火",
      attackBonus: 0.15, // 攻撃力+15%
      criticalBonus: 0.2, // クリティカル率+20%
    };
  } else if (speedDiff >= 30) {
    return {
      name: "先制",
      attackBonus: 0.15, // 攻撃力+15%
      criticalBonus: 0, // クリティカル率ボーナスなし
    };
  }

  return null; // ボーナスなし
}
