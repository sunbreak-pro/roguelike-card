export type BuffDebuffType =
  // デバフ - 持続ダメージ系
  | "bleed" // 出血（特殊実装: カード使用/行動毎に最大HPの5%）
  | "poison" // 毒（毎ターン終了時、スタック×2ダメージ）
  | "burn" // 火傷（毎ターン終了時、スタック×3ダメージ）
  | "curse" // 呪い（回復効果-50%、毎ターン終了時スタック×2ダメージ）
  // デバフ - 状態異常系
  | "slow" // スロウ（速度-10/スタック）
  | "stun" // 気絶（行動不可）
  | "weak" // 弱体化（攻撃力-30%）
  // デバフ - 能力減少系
  | "atkDown" // 攻撃力低下（30%）
  | "defDown" // 防御力低下（30%）
  | "speedDown" // 速度低下（30%）
  | "healingDown" // 回復効果減少（30%）
  // バフ - 能力上昇系
  | "atkUp" // 攻撃力上昇（30%）
  | "defUp" // 防御力上昇（30%）
  | "penetrationUp" // 貫通力上昇（30%）
  | "critical" // クリティカル率上昇（15%）
  | "evasion" // 回避率上昇（25%）
  | "speedUp" // 速度上昇（30%）
  // バフ - 回復・防御系
  | "regeneration" // 再生（毎ターン5HP回復）
  | "shieldRegen" // シールド再生（毎ターン5Guard）
  | "reflect" // 反撃（被ダメージの30%反射）
  | "immunity" // デバフ無効
  // バフ - リソース管理系
  | "energyRegen" // エナジー再生（+1）
  | "drawPower" // ドロー強化（+1枚）
  | "costReduction" // コスト軽減（-1）
  // バフ - 戦闘スタイル変化系
  | "thorns" // 棘の鎧（攻撃者に5ダメージ）
  | "lifesteal" // 吸血（与ダメージの30%回復）
  | "doubleStrike" // 連撃（攻撃が2回発動、威力50%）
  | "splash" // 範囲拡大（隣接敵に50%ダメージ）
  // バフ - キャラクター固有系（剣士）
  | "swordEnergyGain" // 剣気増幅（+30%）
  | "swordEnergyEfficiency" // 剣気効率（消費-30%）
  // バフ - キャラクター固有系（魔術士）
  | "resonanceExtension" // 共鳴延長（+30%）
  | "elementalMastery" // 属性熟練（+30%）
  // バフ - キャラクター固有系（召喚士）
  | "summonDuration" // 召喚延長（+30%）
  | "summonPower" // 召喚強化（+30%）
  | "sacrificeBonus" // 犠牲強化（+30%）
  // バフ - 特殊効果系
  | "damageReduction" // ダメージ軽減（-30%）
  | "focus" // 集中（次カード効果+50%）
  | "momentum" // 勢い（カード使用ごとに攻撃力+5%累積）
  | "cleanse" // 自動浄化（毎ターン1デバフ解除）
  | "tenacity" // 不屈（HP30%以下で全能力+30%）
  | "lastStand"; // 背水の陣（HP1で耐える、1回）

/**
 * 各buff/debuffの効果値定義
 * カードはこの値を参照し、個別にvalueを指定しない
 */
export interface BuffEffectDefinition {
  name: string;           // 日本語名
  value: number;          // 効果値（%またはフラット値）
  isDebuff: boolean;      // デバフかどうか
  isPercentage: boolean;  // %値かフラット値か
  description(): string;    // 効果説明
}

export const BUFF_EFFECTS: Record<BuffDebuffType, BuffEffectDefinition> = {
  // === デバフ - 持続ダメージ系 ===
  bleed: { name: "出血", value: 5, isDebuff: true, isPercentage: true, description: () => `カード使用毎に最大HPの${BUFF_EFFECTS.bleed.value}%ダメージ` },
  poison: { name: "毒", value: 2, isDebuff: true, isPercentage: false, description: () => `ターン終了時スタック×${BUFF_EFFECTS.poison.value}ダメージ` },
  burn: { name: "火傷", value: 3, isDebuff: true, isPercentage: false, description: () => `毎ターン終了時スタック数×${BUFF_EFFECTS.burn.value}ダメージ` },
  curse: { name: "呪い", value: 50, isDebuff: true, isPercentage: true, description: () => `回復効果-${BUFF_EFFECTS.curse.value}%、毎ターンスタック×2ダメージ` },

  // === デバフ - 状態異常系 ===
  slow: { name: "スロウ", value: 10, isDebuff: true, isPercentage: false, description: () => `速度-${BUFF_EFFECTS.slow.value}/スタック` },
  stun: { name: "気絶", value: 100, isDebuff: true, isPercentage: true, description: () => "行動不可" },
  weak: { name: "弱体化", value: 30, isDebuff: true, isPercentage: true, description: () => "攻撃力-30%" },

  // === デバフ - 能力減少系（全て30%）===
  atkDown: { name: "攻撃力低下", value: 30, isDebuff: true, isPercentage: true, description: () => `攻撃力-${BUFF_EFFECTS.atkDown.value}%` },
  defDown: { name: "防御力低下", value: 30, isDebuff: true, isPercentage: true, description: () => `防御力-${BUFF_EFFECTS.defDown.value}%` },
  speedDown: { name: "速度低下", value: 30, isDebuff: true, isPercentage: true, description: () => `速度-${BUFF_EFFECTS.speedDown.value}%` },
  healingDown: { name: "回復効果低下", value: 30, isDebuff: true, isPercentage: true, description: () => `回復効果-${BUFF_EFFECTS.healingDown.value}%` },

  // === バフ - 能力上昇系（全て30%、特殊除く）===
  atkUp: { name: "攻撃力上昇", value: 30, isDebuff: false, isPercentage: true, description: () => `攻撃力+${BUFF_EFFECTS.atkUp.value}%` },
  defUp: { name: "防御力上昇", value: 30, isDebuff: false, isPercentage: true, description: () => `防御力+${BUFF_EFFECTS.defUp.value}%` },
  penetrationUp: { name: "貫通力上昇", value: 30, isDebuff: false, isPercentage: true, description: () => `貫通力+${BUFF_EFFECTS.penetrationUp.value}%` },
  critical: { name: "クリティカル率上昇", value: 15, isDebuff: false, isPercentage: true, description: () => `クリティカル率+${BUFF_EFFECTS.critical.value}%` },
  evasion: { name: "回避率上昇", value: 25, isDebuff: false, isPercentage: true, description: () => `回避率+${BUFF_EFFECTS.evasion.value}%` },
  speedUp: { name: "速度上昇", value: 30, isDebuff: false, isPercentage: true, description: () => `速度+${BUFF_EFFECTS.speedUp.value}%` },
  // === バフ - 回復・防御系 ===
  regeneration: { name: "再生", value: 5, isDebuff: false, isPercentage: false, description: () => `毎ターン${BUFF_EFFECTS.regeneration.value}HP回復` },
  shieldRegen: { name: "シールド再生", value: 5, isDebuff: false, isPercentage: false, description: () => `毎ターンGuard+${BUFF_EFFECTS.shieldRegen.value}` },
  reflect: { name: "反射", value: 30, isDebuff: false, isPercentage: true, description: () => `被ダメージの${BUFF_EFFECTS.reflect.value}%を反射` },
  immunity: { name: "無敵", value: 1, isDebuff: false, isPercentage: false, description: () => "デバフ無効" },
  // === バフ - リソース管理系 ===
  energyRegen: { name: "エナジー再生", value: 1, isDebuff: false, isPercentage: false, description: () => "エナジー+" },
  drawPower: { name: "ドロー増加", value: 1, isDebuff: false, isPercentage: false, description: () => "ドロー+1枚" },
  costReduction: { name: "コスト減少", value: 1, isDebuff: false, isPercentage: false, description: () => "コスト-1" },
  // === バフ - 戦闘スタイル変化系 ===
  thorns: { name: "とげ", value: 5, isDebuff: false, isPercentage: false, description: () => `攻撃者に${BUFF_EFFECTS.thorns.value}ダメージ` },
  lifesteal: { name: "ライフスティール", value: 30, isDebuff: false, isPercentage: true, description: () => `与ダメージの${BUFF_EFFECTS.lifesteal.value}%をHP回復` },
  doubleStrike: { name: "ダブルストライク", value: 50, isDebuff: false, isPercentage: true, description: () => `攻撃が2回発動（威力${BUFF_EFFECTS.doubleStrike.value}%）` },
  splash: { name: "スプラッシュ", value: 50, isDebuff: false, isPercentage: true, description: () => `隣接敵に${BUFF_EFFECTS.splash.value}%ダメージ` },

  // === バフ - キャラクター固有系（剣士）===
  swordEnergyGain: { name: "剣気獲得量", value: 3, isDebuff: false, isPercentage: true, description: () => `剣気獲得量+${BUFF_EFFECTS.swordEnergyGain.value}%` },
  swordEnergyEfficiency: { name: "剣気消費効率", value: 2, isDebuff: false, isPercentage: true, description: () => `剣気消費-${BUFF_EFFECTS.swordEnergyEfficiency.value}%` },
  // === バフ - キャラクター固有系（魔術士）===
  resonanceExtension: { name: "共鳴効果延長", value: 30, isDebuff: false, isPercentage: true, description: () => `共鳴効果+${BUFF_EFFECTS.resonanceExtension.value}%` },
  elementalMastery: { name: "元素熟達", value: 30, isDebuff: false, isPercentage: true, description: () => `属性ダメージ+${BUFF_EFFECTS.elementalMastery.value}%` },

  // === バフ - キャラクター固有系（召喚士）===
  summonDuration: { name: "召喚持続", value: 30, isDebuff: false, isPercentage: true, description: () => `召喚持続+${BUFF_EFFECTS.summonDuration.value}%` },
  summonPower: { name: "召喚獣能力", value: 30, isDebuff: false, isPercentage: true, description: () => `召喚獣能力+${BUFF_EFFECTS.summonPower.value}%` },
  sacrificeBonus: { name: "犠牲効果", value: 30, isDebuff: false, isPercentage: true, description: () => `犠牲効果+${BUFF_EFFECTS.sacrificeBonus.value}%` },

  // === バフ - 特殊効果系 ===
  damageReduction: { name: "被ダメージ軽減", value: 30, isDebuff: false, isPercentage: true, description: () => `被ダメージ-${BUFF_EFFECTS.damageReduction.value}%` },
  focus: { name: "集中", value: 50, isDebuff: false, isPercentage: true, description: () => `次カード効果+${BUFF_EFFECTS.focus.value}%` },
  momentum: { name: "勢い", value: 5, isDebuff: false, isPercentage: true, description: () => `カード使用毎に攻撃力+${BUFF_EFFECTS.momentum.value}%累積` },
  cleanse: { name: "浄化", value: 1, isDebuff: false, isPercentage: false, description: () => "毎ターン1デバフ解除" },
  tenacity: { name: "不屈", value: 30, isDebuff: false, isPercentage: true, description: () => "HP30%以下で全能力+30%" },
  lastStand: { name: "ラストスタンド", value: 1, isDebuff: false, isPercentage: false, description: () => "致死ダメージを1回耐える" },
};

/**
 * buff/debuffの効果値を取得するヘルパー関数
 */
export function getBuffValue(type: BuffDebuffType): number {
  return BUFF_EFFECTS[type].value;
}

/**
 * カードで指定するbuff/debuff（valueは含まない）
 * 効果値はBUFF_EFFECTSから自動取得される
 */
export interface CardBuffSpec {
  name: BuffDebuffType;
  duration: number;     // 持続ターン数
  stacks: number;       // スタック数
  isPermanent?: boolean; // 永続かどうか（省略時false）
}

/**
 * ランタイムのbuff/debuff状態（valueを含む）
 */
export interface BuffDebuffState {
  name: BuffDebuffType;
  stacks: number;       // スタック数
  duration: number;     // 残りターン数（-1で永続）
  value: number;        // 効果値（BUFF_EFFECTSから取得）
  isPermanent: boolean; // 永続かどうか
  source?: string;      // 発生源（カードIDなど）
}

// バフ/デバフマップ
export type BuffDebuffMap = Map<BuffDebuffType, BuffDebuffState>;

/**
 * CardBuffSpecをBuffDebuffStateに変換
 * valueはBUFF_EFFECTSから自動取得
 */
export function createBuffState(buff: CardBuffSpec, source?: string): BuffDebuffState {
  return {
    name: buff.name,
    stacks: buff.stacks,
    duration: buff.duration,
    value: BUFF_EFFECTS[buff.name].value,
    isPermanent: buff.isPermanent ?? false,
    source,
  };
}