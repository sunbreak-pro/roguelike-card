/**
 * @deprecated このファイルは非推奨です。card.ts の calculateCardEffect を使用してください。
 */
import type { Card } from "../type/cardType.ts";
import { calculateEffectivePower } from "./card";
import type { BuffDebuffState } from "../type/baffType.ts";
import { createBuffState } from "../type/baffType.ts";

/**
 * カード効果の適用結果
 */
export interface CardEffectResult {
  damageToEnemy?: number;
  shieldGain?: number;
  hpGain?: number;
  enemyDebuffs?: BuffDebuffState[];
  playerBuffs?: BuffDebuffState[];
}

/**
 * カードの効果を計算
 * @deprecated card.ts の calculateCardEffect を使用してください
 */
export const calculateCardEffect = (card: Card): CardEffectResult => {
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
};

/**
 * カードプレイが可能かどうかを判定
 * @param card プレイしようとするカード
 * @param currentEnergy 現在のエナジー
 * @param isPlayerTurn プレイヤーのターンかどうか
 * @returns プレイ可能かどうか
 */
export const canPlayCard = (
  card: Card,
  currentEnergy: number,
  isPlayerTurn: boolean
): boolean => {
  return isPlayerTurn && card.cost <= currentEnergy;
};
