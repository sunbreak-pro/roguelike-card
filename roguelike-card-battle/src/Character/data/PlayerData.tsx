import {} from "react";

export type CharacterClass = "swordsman" | "mage" | "summoner";

export interface Player {
  characterClass: CharacterClass;
  classGrade: string;
  level: number;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  guard: number;
  speed: number;
  initialEnergy: number;
  gold: number;
  deck: string[]; // Card IDs
  equipment: string[]; // Equipment IDs
  tittle?: string[]; //title IDs
  statusEffects: Record<string, number>; // StatusEffect ID to duration
}

export const Swordman_Status: Player = {
  characterClass: "swordsman",
  classGrade: getSwordsmanTitle(0),
  level: 1,
  hp: 100,
  maxHp: 110,
  ap: 30,
  maxAp: 30,
  guard: 0,
  speed: 50,
  initialEnergy: 3,
  gold: 0,
  deck: [],
  equipment: [],
  statusEffects: {},
};

export const Mage_Status: Player = {
  characterClass: "swordsman",
  classGrade: getMageTitle(0),
  level: 1,
  hp: 60,
  maxHp: 60,
  ap: 30,
  maxAp: 30,
  guard: 0,
  speed: 50,
  initialEnergy: 3,
  gold: 0,
  deck: [],
  equipment: [],
  statusEffects: {},
};

/**
 * 召喚士の基本ステータス
 */
export const Summon_Status: Player = {
  characterClass: "swordsman",
  classGrade: getSwordsmanTitle(0),
  level: 1,
  hp: 100,
  maxHp: 100,
  ap: 30,
  maxAp: 30,
  guard: 0,
  speed: 50,
  initialEnergy: 3,
  gold: 0,
  deck: [],
  equipment: [],
  statusEffects: {},
};

/**
 * 剣士の称号取得
 */
export function getSwordsmanTitle(cardTypeCount: number): string {
  if (cardTypeCount >= 50) return "剣神";
  if (cardTypeCount >= 30) return "剣聖";
  if (cardTypeCount >= 15) return "剣豪";
  if (cardTypeCount >= 5) return "剣士";
  return "見習い剣士";
}

/**
 * 魔術士の称号取得
 */
export function getMageTitle(cardTypeCount: number): string {
  if (cardTypeCount >= 50) return "魔神";
  if (cardTypeCount >= 30) return "大魔導師";
  if (cardTypeCount >= 15) return "魔導師";
  if (cardTypeCount >= 5) return "魔術士";
  return "見習い魔術士";
}

/**
 * 召喚士の称号取得
 */
export function getSummonerTitle(cardTypeCount: number): string {
  if (cardTypeCount >= 50) return "召喚神";
  if (cardTypeCount >= 30) return "召喚師";
  if (cardTypeCount >= 15) return "上級召喚士";
  if (cardTypeCount >= 5) return "召喚士";
  return "見習い召喚士";
}
