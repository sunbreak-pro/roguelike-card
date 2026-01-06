import { createRef } from "react";
import type { Enemy } from "../../characters/type/enemyType";
import type { EnemyBattleState } from "../type/battleStateType";

/**
 * Create initial battle state for an enemy
 */
export function createEnemyState(enemy: Enemy): EnemyBattleState {
    return {
        enemy,
        hp: enemy.maxHp,
        ap: enemy.maxAp,
        isGuard: enemy.startingGuard,
        guard: enemy.guard,
        energy: enemy.actEnergy,
        speed: enemy.speed,
        buffs: new Map(),
        phaseCount: 1,
        ref: createRef<HTMLDivElement>(),
    };
}
