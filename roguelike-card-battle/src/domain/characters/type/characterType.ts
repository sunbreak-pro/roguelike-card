import type { BuffDebuffMap } from "../../battles/type/baffType";
export interface Character {
    hp: number;
    maxHp: number;
    ap: number;
    maxAp: number;
    guard: number;
    startingGuard?: boolean;
    speed: number;
    buffDebuffs?: BuffDebuffMap;
    imagePath?: string;
}