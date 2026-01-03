/**
 * ダメージ計算ロジック (Ver 3.0)
 * battle_logic.mdの仕様に基づく包括的なダメージ計算システム
 */

import type { BuffDebuffMap } from "../../cards/type/baffType";
import type { Card } from "../../cards/type/cardType";

/**
 * キャラクター（プレイヤーまたは敵）のインターフェース
 */
export interface Character {
  name?: string;
  className?: string;
  hp: number;
  maxHp: number;
  ap: number; // Armor Points（装備耐久値）
  maxAp: number;
  guard: number; // Guard Points（一時的な防御）
  buffDebuffs: BuffDebuffMap;
  equipmentDefPercent?: number; // 装備による防御力（%）
}

/**
 * ダメージ計算結果
 */
export interface DamageResult {
  finalDamage: number; // 最終ダメージ量
  isCritical: boolean; // クリティカルヒットかどうか
  reflectDamage: number; // 反撃ダメージ
  lifestealAmount: number; // 吸血回復量
  thornsDamage: number; // 棘の鎧ダメージ
}

/**
 * ダメージ配分結果
 */
export interface DamageAllocation {
  guardDamage: number;
  apDamage: number;
  hpDamage: number;
}

/**
 * 深度情報
 */
export interface DepthInfo {
  depth: number;
  name: string;
}

/**
 * 深度スケーリングテーブル
 */
const DEPTH_TABLE: Map<number, DepthInfo> = new Map([
  [1, { depth: 1, name: "腐食" }],
  [2, { depth: 2, name: "狂乱" }],
  [3, { depth: 3, name: "混沌" }],
  [4, { depth: 4, name: "虚無" }],
  [5, { depth: 5, name: "深淵" }],
]);

/**
 * 深度情報を取得
 */
export function getDepthInfo(depth: number): DepthInfo {
  const info = DEPTH_TABLE.get(depth);
  if (!info) {
    return DEPTH_TABLE.get(1)!; // デフォルトは深度1
  }
  return info;
}

/**
 * 攻撃力の倍率計算（バフ/デバフ）
 */
export function calculateAttackMultiplier(buffDebuffs: BuffDebuffMap): number {
  let multiplier = 1.0;

  // 攻撃力上昇バフ
  if (buffDebuffs.has("atkUp")) {
    const buff = buffDebuffs.get("atkUp")!;
    multiplier += buff.value / 100;
  }

  // Momentum（勢い）バフ - スタック数に応じて累積
  if (buffDebuffs.has("momentum")) {
    const momentum = buffDebuffs.get("momentum")!;
    multiplier += (momentum.value / 100) * momentum.stacks;
  }

  // 攻撃力低下デバフ
  if (buffDebuffs.has("weak")) {
    const weak = buffDebuffs.get("weak")!;
    multiplier *= 1 - weak.value / 100;
  }


  if (buffDebuffs.has("atkDown")) {
    const atkDown = buffDebuffs.get("atkDown")!;
    multiplier *= 1 - atkDown.value / 100;
  }

  return multiplier;
}

/**
 * Phase 3: クリティカル率の計算
 */
export function calculateCriticalRate(buffDebuffs: BuffDebuffMap): number {
  let rate = 0.1; // 基本クリティカル率10%

  if (buffDebuffs.has("critical")) {
    const buff = buffDebuffs.get("critical")!;
    rate += buff.value / 100;
  }

  return Math.min(0.8, rate); // 最大80%
}

/**
 * Phase 5: 防御側のバフ/デバフ補正
 */
function calculateDefenseModifier(buffDebuffs: BuffDebuffMap): {
  vulnerabilityMod: number;
  damageReductionMod: number;
} {
  let vulnerabilityMod = 1.0;
  let damageReductionMod = 1.0;

  // ダメージ軽減バフ
  if (buffDebuffs.has("damageReduction")) {
    const reduction = buffDebuffs.get("damageReduction")!;
    damageReductionMod *= 1 - reduction.value / 100;
  }

  // 不屈バフ - デバフの効果を軽減
  if (buffDebuffs.has("tenacity")) {
    const tenacity = buffDebuffs.get("tenacity")!;
    // 脆弱性の効果を軽減
    if (vulnerabilityMod > 1.0) {
      const excessVuln = vulnerabilityMod - 1.0;
      vulnerabilityMod = 1.0 + excessVuln * (1 - tenacity.value / 100);
    }
  }

  return { vulnerabilityMod, damageReductionMod };
}

/**
 * Phase 7: 反撃ダメージ計算
 */
export function calculateReflectDamage(
  buffDebuffs: BuffDebuffMap,
  damage: number
): number {
  let reflectDamage = 0;

  if (buffDebuffs.has("reflect")) {
    const reflect = buffDebuffs.get("reflect")!;
    reflectDamage = Math.floor(damage * (reflect.value / 100));
  }

  return reflectDamage;
}

/**
 * Phase 7: 吸血回復計算
 */
export function calculateLifesteal(
  buffDebuffs: BuffDebuffMap,
  damage: number
): number {
  let healAmount = 0;

  if (buffDebuffs.has("lifesteal")) {
    const lifesteal = buffDebuffs.get("lifesteal")!;
    healAmount = Math.floor(damage * (lifesteal.value / 100));
  }

  return healAmount;
}

/**
 * Phase 7: 棘の鎧ダメージ計算
 */
export function calculateThornsDamage(
  buffDebuffs: BuffDebuffMap,
  cardCategory: string
): number {
  let thornsDamage = 0;

  if (buffDebuffs.has("thorns") && cardCategory === "physical") {
    const thorns = buffDebuffs.get("thorns")!;
    thornsDamage = thorns.value * thorns.stacks;
  }

  return thornsDamage;
}

/**
 * メイン: ダメージ計算関数
 *
 * シンプルなダメージ計算：
 * - カードの基本ダメージをそのまま使用
 * - バフ/デバフがある場合のみ補正
 * - クリティカルは明示的なバフがある場合のみ
 */
export function calculateDamage(
  attacker: Character,
  defender: Character,
  card: Card,
): DamageResult {
  // --- 基本攻撃力 = カードのbasePower ---
  const baseDmg = card.baseDamage || 0;

  // --- バフ/デバフによる攻撃力補正 ---
  const atkMultiplier = calculateAttackMultiplier(attacker.buffDebuffs);

  // --- クリティカル判定（criticalバフがある場合のみ）---
  let critMod = 1.0;
  let isCritical = false;

  if (attacker.buffDebuffs.has("critical")) {
    const critRate = calculateCriticalRate(attacker.buffDebuffs);
    isCritical = Math.random() < critRate && !attacker.buffDebuffs.has("weak");

    if (isCritical) {
      critMod = 1.5; // 基本クリティカルダメージ150%
      const critBuff = attacker.buffDebuffs.get("critical")!;
      critMod += critBuff.value / 100;
    }
  }

  // --- 最終攻撃力 ---
  const finalAtk = Math.floor(baseDmg * atkMultiplier * critMod);

  // --- 防御側のバフ/デバフ補正 ---
  const { vulnerabilityMod, damageReductionMod } = calculateDefenseModifier(defender.buffDebuffs);

  const incomingDmg = Math.floor(finalAtk * vulnerabilityMod * damageReductionMod);

  // --- 特殊効果処理 ---
  const reflectDamage = calculateReflectDamage(defender.buffDebuffs, incomingDmg);
  const lifestealAmount = calculateLifesteal(attacker.buffDebuffs, incomingDmg);
  const thornsDamage = calculateThornsDamage(defender.buffDebuffs, card.category);

  return {
    finalDamage: incomingDmg,
    isCritical,
    reflectDamage,
    lifestealAmount,
    thornsDamage,
  };
}
/**
 * ダメージ配分ロジック
 *
 * ルール：
 * - Guardへのダメージ = ダメージそのまま
 * - Guardがある状態かつAPがある状態でダメージを受けた場合、貫通分は0%
 * - Guardがある状態かつAPがない状態でダメージを受けた場合、HPに75%の追加ダメージ
 * - AP（装備耐久値）でダメージを受ける
 * - APが0の場合は直接HPにダメージ
 */

export function applyDamageAllocation(
  defender: Character,
  damage: number
): DamageAllocation {
  let remainingDmg = damage;
  let guardDmg = 0;
  let apDmg = 0;
  let hpDmg = 0;
  const hadGuard = defender.guard > 0;

  // Step 2: Guardでの受け（ダメージそのまま）
  if (hadGuard) {
    if (defender.guard >= remainingDmg && defender.ap <= 0) {
      guardDmg = remainingDmg;
      hpDmg = Math.floor(remainingDmg * 0.75); // Guardがある状態でAPがない場合、HPに75%追加ダメージ
      remainingDmg = 0;
      return { guardDamage: guardDmg, apDamage: apDmg, hpDamage: hpDmg };
    } else if (defender.guard >= remainingDmg) {
      guardDmg = remainingDmg;
      remainingDmg = 0;
      return { guardDamage: guardDmg, apDamage: 0, hpDamage: 0 };
    }
    else {
      guardDmg = defender.guard;
      remainingDmg -= defender.guard;
    }
  }
  // Step 4: APでの受け
  if (defender.ap > 0) {
    if (defender.ap >= remainingDmg) {
      apDmg = remainingDmg;
      remainingDmg = 0;
      return { guardDamage: guardDmg, apDamage: apDmg, hpDamage: 0 };
    } else {
      apDmg = defender.ap;
      remainingDmg -= defender.ap;
    }
  }

  // Step 5: HPでの受け（残りのダメージ）
  if (remainingDmg > 0) {
    hpDmg = remainingDmg;
  }

  return {
    guardDamage: guardDmg,
    apDamage: apDmg,
    hpDamage: hpDmg,
  };
}

