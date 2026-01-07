import type { BuffDebuffState } from "../../battles/type/baffType";
import type { Character } from "./characterType";
export type EnemyActionType = "attack" | "buff" | "debuff" | "special";

export interface Enemy extends Character {
    id: string;
    name: string;
    nameJa?: string;
    description: string;
    maxHp: number;
    maxAp: number;
    speed: number;
    actEnergy: number;
    startingGuard: Character["startingGuard"];
    aiPatterns: EnemyAIPattern[];
    buffDebuffs?: Character["buffDebuffs"];
    imagePath?: string;
}

export interface EnemyAction {
    name: string;
    type: EnemyActionType;
    baseDamage: number;
    applyDebuffs?: BuffDebuffState[];
    applyBuffs?: BuffDebuffState[];
    guardGain?: number;
    hitCount?: number;
    displayIcon?: string;
    priority?: number;
    energyCost?: number;
}

export interface EnemyAIPattern {
    phaseNumber: number;
    condition?: (hp: number, maxHp: number) => boolean;
    action: EnemyAction;
    probability?: number;
}
