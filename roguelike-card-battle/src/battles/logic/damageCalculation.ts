/**
 * ダメージ計算ロジック (Ver 3.0)
 * battle_logic.mdの仕様に基づく包括的なダメージ計算システム
 */

import type { BuffDebuffMap } from "../../cards/type/baffType";
import type { Card } from "../../cards/type/cardType";

/**
 * Character's interface for damage calculation
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
 * Calculate attack multiplier from buffs/debuffs (Minor/Major system)
 */
export function calculateAttackMultiplier(buffDebuffs: BuffDebuffMap): number {
  let multiplier = 1.0;

  // Attack buffs (Minor: +15%, Major: +30%)
  if (buffDebuffs.has("atkUpMinor")) {
    const buff = buffDebuffs.get("atkUpMinor")!;
    multiplier += buff.value / 100;
  }
  if (buffDebuffs.has("atkUpMajor")) {
    const buff = buffDebuffs.get("atkUpMajor")!;
    multiplier += buff.value / 100;
  }

  // Momentum buff - stacks accumulate
  if (buffDebuffs.has("momentum")) {
    const momentum = buffDebuffs.get("momentum")!;
    multiplier += (momentum.value / 100) * momentum.stacks;
  }

  // Attack debuffs (Minor: -15%, Major: -30%)
  if (buffDebuffs.has("atkDownMinor")) {
    const buff = buffDebuffs.get("atkDownMinor")!;
    multiplier *= 1 - buff.value / 100;
  }
  if (buffDebuffs.has("atkDownMajor")) {
    const buff = buffDebuffs.get("atkDownMajor")!;
    multiplier *= 1 - buff.value / 100;
  }

  return multiplier;
}

/**
 * Calculate critical hit rate
 */
export function calculateCriticalRate(buffDebuffs: BuffDebuffMap): number {
  let rate = 0.1; // Base 10% critical rate

  if (buffDebuffs.has("criticalUp")) {
    const buff = buffDebuffs.get("criticalUp")!;
    rate += buff.value / 100;
  }

  return Math.min(0.8, rate); // Max 80%
}

/**
 * Calculate defense modifiers from buffs/debuffs
 */
function calculateDefenseModifier(buffDebuffs: BuffDebuffMap): {
  vulnerabilityMod: number;
  damageReductionMod: number;
} {
  let vulnerabilityMod = 1.0;
  let damageReductionMod = 1.0;

  // Defense buffs reduce incoming damage (Minor: +15%, Major: +30%)
  if (buffDebuffs.has("defUpMinor")) {
    const buff = buffDebuffs.get("defUpMinor")!;
    damageReductionMod *= 1 - buff.value / 100;
  }
  if (buffDebuffs.has("defUpMajor")) {
    const buff = buffDebuffs.get("defUpMajor")!;
    damageReductionMod *= 1 - buff.value / 100;
  }

  // Defense debuffs increase incoming damage (Minor: +15%, Major: +30%)
  if (buffDebuffs.has("defDownMinor")) {
    const buff = buffDebuffs.get("defDownMinor")!;
    vulnerabilityMod *= 1 + buff.value / 100;
  }
  if (buffDebuffs.has("defDownMajor")) {
    const buff = buffDebuffs.get("defDownMajor")!;
    vulnerabilityMod *= 1 + buff.value / 100;
  }

  // Tenacity buff - reduces debuff effects when HP < 30%
  if (buffDebuffs.has("tenacity")) {
    const tenacity = buffDebuffs.get("tenacity")!;
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

export function calculateDamage(
  attacker: Character,
  defender: Character,
  card: Card,
): DamageResult {
  // --- 基本攻撃力 = カードのbasePower ---
  const baseDmg = card.baseDamage || 0;

  // --- バフ/デバフによる攻撃力補正 ---
  const atkMultiplier = calculateAttackMultiplier(attacker.buffDebuffs);

  // --- Critical check (only when criticalUp buff is present) ---
  let critMod = 1.0;
  let isCritical = false;

  if (attacker.buffDebuffs.has("criticalUp")) {
    const critRate = calculateCriticalRate(attacker.buffDebuffs);
    isCritical = Math.random() < critRate;

    if (isCritical) {
      critMod = 1.5; // Base critical damage 150%
      const critBuff = attacker.buffDebuffs.get("criticalUp")!;
      critMod += critBuff.value / 100;
    }
  }

  // --- Final attack power ---
  const finalAtk = Math.floor(baseDmg * atkMultiplier * critMod);

  // --- Defense side buff/debuff modifiers ---
  const { vulnerabilityMod, damageReductionMod } = calculateDefenseModifier(defender.buffDebuffs);

  const incomingDmg = Math.floor(finalAtk * vulnerabilityMod * damageReductionMod);

  // --- Special effect processing ---
  const reflectDamage = calculateReflectDamage(defender.buffDebuffs, incomingDmg);
  const lifestealAmount = calculateLifesteal(attacker.buffDebuffs, incomingDmg);

  return {
    finalDamage: incomingDmg,
    isCritical,
    reflectDamage,
    lifestealAmount,
  };
}
/**
 * damage allocation logic
 *
 * rule：
 * - damage to Guard = damage as is
 * - If Guard and AP are present when taking damage, penetration is 0%
 * - If Guard is present but AP is not when taking damage, additional 75% damage to HP
 * - Damage is taken from AP (equipment durability)
 * - If AP is 0, damage is taken directly to HP
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

  // Step 2: Damage to Guard (damage as is)
  if (hadGuard) {
    if (defender.guard >= remainingDmg && defender.ap <= 0) {
      guardDmg = remainingDmg;
      hpDmg = Math.floor(remainingDmg * 0.75); // If Guard is present but AP is not, additional 75% damage to HP
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
  // Step 4: Damage to AP (equipment durability)
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

  // Step 5: Damage to HP (remaining damage)
  if (remainingDmg > 0) {
    hpDmg = remainingDmg;
  }

  return {
    guardDamage: guardDmg,
    apDamage: apDmg,
    hpDamage: hpDmg,
  };
}

