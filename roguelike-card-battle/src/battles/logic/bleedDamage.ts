/**
 * 出血ダメージ計算（特殊実装）
 * Battle System Ver 4.0
 *
 * プレイヤー: カード使用毎に最大HPの5%ダメージ
 * 敵: 1行動毎に最大HPの5%ダメージ
 */

import type { BuffDebuffMap } from "../../cards/type/baffType";

/**
 * 出血ダメージ計算
 * プレイヤーのカード使用時、または敵の1行動実行時に呼び出される
 *
 * @param maxHp 対象の最大HP
 * @param buffDebuffs 対象のバフ/デバフマップ
 * @returns 出血ダメージ（最大HPの5%、出血状態でない場合は0）
 */
export function calculateBleedDamage(
  maxHp: number,
  buffDebuffs: BuffDebuffMap
): number {
  if (!buffDebuffs.has("bleed")) {
    return 0;
  }

  // 最大HPの5%（小数点以下切り捨て）
  const bleedDamage = Math.floor(maxHp * 0.05);

  return bleedDamage;
}

/**
 * 出血状態かどうかをチェック
 */
export function hasBleed(buffDebuffs: BuffDebuffMap): boolean {
  return buffDebuffs.has("bleed");
}
