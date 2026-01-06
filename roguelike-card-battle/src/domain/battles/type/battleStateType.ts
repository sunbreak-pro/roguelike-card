import type { Enemy } from "../../characters/type/enemyType";
import type { BuffDebuffMap } from "./baffType";

export interface EnemyBattleState {
    enemy: Enemy;
    hp: number;
    ap: number;
    isGuard?: boolean;
    guard: number;
    energy: number;
    speed: number;
    buffs: BuffDebuffMap;
    phaseCount?: number;
    turnCount?: number;
    ref: React.RefObject<HTMLDivElement | null>;
}
