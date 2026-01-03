import type { Card, MasteryLevel } from "../type/cardType";
import { MASTERY_THRESHOLDS } from "../type/cardType";
// ==========================================
// ヘルパー関数
// ==========================================

/**
 * カードの実効威力を計算（深度ボーナス廃止、熟練度とジェムのみ）
 */
export function calculateEffectivePower(card: Card): number {
  if (!card.baseDamage) return 0;

  let damage = card.baseDamage;

  // 熟練度ボーナス (Lv0: 1.0, Lv1: 1.1, Lv2: 1.2, Lv3: 1.3)
  const masteryBonus = 1 + card.masteryLevel * 0.1;

  // ジェムレベルボーナス
  damage *= (masteryBonus + card.gemLevel * 0.5);

  return Math.round(damage);
}

/**
 * 使用回数から熟練度レベルを計算
 */
export function calculateMasteryLevel(useCount: number): MasteryLevel {
  if (useCount >= MASTERY_THRESHOLDS[3]) return 3;
  if (useCount >= MASTERY_THRESHOLDS[2]) return 2;
  if (useCount >= MASTERY_THRESHOLDS[1]) return 1;
  return 0;
}

/**
 * カードが才能化可能かチェック
 */
export function canBecomeTalent(card: Card): boolean {
  return card.useCount >= MASTERY_THRESHOLDS[3] && card.masteryLevel < 3;
}

/**
 * カードの使用回数をインクリメント
 */
export function incrementUseCount(card: Card): Card {
  const newUseCount = card.useCount + 1;
  const newMasteryLevel = calculateMasteryLevel(newUseCount);

  return {
    ...card,
    useCount: newUseCount,
    masteryLevel: newMasteryLevel,
  };
}

/**
 * カードプレイが可能かどうかを判定
 */
export function canPlayCard(
  card: Card,
  currentEnergy: number,
  isPlayerTurn: boolean
): boolean {
  return isPlayerTurn && card.cost <= currentEnergy;
}

// ==========================================
// カード効果計算
// ==========================================
import type { BuffDebuffState } from "../type/baffType";
import { createBuffState } from "../type/baffType";

export interface CardEffectResult {
  damageToEnemy?: number;
  shieldGain?: number;
  hpGain?: number;
  enemyDebuffs?: BuffDebuffState[];
  playerBuffs?: BuffDebuffState[];
}

/**
 * カードの効果を計算
 * buff/debuffのvalueはBUFF_EFFECTSから自動取得
 */
export function calculateCardEffect(
  card: Card,
): CardEffectResult {
  const effectivePower = calculateEffectivePower(card);
  const result: CardEffectResult = {};

  switch (card.category) {
    case "atk":
      result.damageToEnemy = effectivePower;
      break;
    case "def":
      result.shieldGain = effectivePower;
      break;
    case "heal":
      result.hpGain = effectivePower;
      break;
  }

  // CardBuffSpec → BuffDebuffState に変換（valueはBUFF_EFFECTSから自動取得）
  if (card.applyEnemyDebuff && card.applyEnemyDebuff.length > 0) {
    result.enemyDebuffs = card.applyEnemyDebuff.map((spec) =>
      createBuffState(spec, card.id)
    );
  }

  if (card.applyPlayerBuff && card.applyPlayerBuff.length > 0) {
    result.playerBuffs = card.applyPlayerBuff.map((spec) =>
      createBuffState(spec, card.id)
    );
  }

  return result;
}
