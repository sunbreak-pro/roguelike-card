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
 * プレイヤーの速度計算
 */
export function calculatePlayerSpeed(buffs: BuffDebuffMap): number {
  let speed = 50; // 基本速度

  // 速度上昇バフ
  if (buffs.has("speedUp")) {
    const speedBuff = buffs.get("speedUp")!;
    speed += speedBuff.value * speedBuff.stacks;
  }

  // スロウデバフ（速度-10/スタック）
  if (buffs.has("slow")) {
    const slowDebuff = buffs.get("slow")!;
    speed -= 10 * slowDebuff.stacks;
  }

  // 速度低下デバフ
  if (buffs.has("speedDown")) {
    const speedDown = buffs.get("speedDown")!;
    speed -= speedDown.value * speedDown.stacks;
  }

  // 加速バフ（速度+30、先制確定級）
  if (buffs.has("haste")) {
    speed += 30;
  }

  return Math.max(0, speed);
}

/**
 * 敵の速度計算
 */
export function calculateEnemySpeed(
  enemy: Enemy,
  buffs: BuffDebuffMap
): number {
  let speed = enemy.speed; // 敵固有の速度

  // バフ/デバフ適用（プレイヤーと同じロジック）
  if (buffs.has("speedUp")) {
    const speedBuff = buffs.get("speedUp")!;
    speed += speedBuff.value * speedBuff.stacks;
  }

  if (buffs.has("slow")) {
    const slowDebuff = buffs.get("slow")!;
    speed -= 10 * slowDebuff.stacks;
  }

  if (buffs.has("speedDown")) {
    const speedDown = buffs.get("speedDown")!;
    speed -= speedDown.value * speedDown.stacks;
  }

  if (buffs.has("haste")) {
    speed += 30;
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
