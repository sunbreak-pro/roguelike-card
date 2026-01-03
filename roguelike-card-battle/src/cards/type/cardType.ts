// ==========================================
// 型定義

import type { CardBuffSpec } from "./baffType";

// ==========================================
export type Depth = 1 | 2 | 3 | 4 | 5;

export type CardCategory = 'atk' | 'def' | 'buff' | 'debuff' | 'heal' | 'swordEnergy';

export type DepthCurveType = 'shallow' | 'neutral' | 'deep' | 'madness' | 'adversity';

export type MasteryLevel = 0 | 1 | 2 | 3;

export type GemLevel = 0 | 1 | 2;

export type Rarity = 'common' | 'rare' | 'epic' | 'legend';

export interface Card {
    id: string;           // ユニークなインスタンスID（例: "sw_001_1", "sw_001_2"）
    cardTypeId: string;   // カード種類ID（例: "sw_001"） - 熟練度共有に使用
    name: string;
    description: string;
    cost: number;
    category: CardCategory;
    depthCurveType: DepthCurveType;
    useCount: number;
    masteryLevel: MasteryLevel;
    gemLevel: GemLevel;
    baseDamage?: number;
    effectivePower?: number;
    talentProgress?: number;
    talentThreshold?: number;
    applyEnemyDebuff?: CardBuffSpec[];
    applyPlayerBuff?: CardBuffSpec[];
    tags: string[];
    rarity: Rarity;
    // 剣士固有プロパティ
    swordEnergyGain?: number;      // 剣気蓄積量
    swordEnergyConsume?: number;   // 剣気消費量（0=全消費）
    swordEnergyMultiplier?: number; // 剣気ダメージ倍率
    hitCount?: number;             // 多段攻撃の回数
    penetration?: number;          // 貫通率（0-1）
    isPreemptive?: boolean;        // 先制攻撃
    healAmount?: number;           // 回復量
    guardAmount?: number;          // シールド付与量
    drawCards?: number;            // 手札追加枚数
    energyGain?: number;           // エナジー回復量
    nextCardCostReduction?: number; // 次のカードのコスト軽減
    characterClass?: 'swordsman' | 'mage' | 'summoner'; // キャラクター専用
}

// ==========================================
// 定数
// ==========================================


export const MAGIC_MULTIPLIERS: Record<Depth, number> = {
    1: 1,
    2: 2,
    3: 4,
    4: 8,
    5: 16,
};

export const MASTERY_THRESHOLDS = {
    0: 0,
    1: 8,
    2: 16,
    3: 24,
};

export const MASTERY_BONUSES: Record<MasteryLevel, number> = {
    0: 1.0,
    1: 1.2,
    2: 1.4,
    3: 2.0,
};

export const CARD_CATEGORY_NAMES: Record<CardCategory, string> = {
    atk: 'atk',
    def: 'def',
    buff: 'buff',
    debuff: 'Debuff',
    heal: 'Heal',
    swordEnergy: 'Sword Energy',
};

export const RARITY_COLORS: Record<Rarity, string> = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legend: '#f59e0b',
};