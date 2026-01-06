export interface DamageResult {
    finalDamage: number;
    isCritical: boolean;
    reflectDamage: number;
    lifestealAmount: number;
}

export interface DamageAllocation {
    guardDamage: number;
    apDamage: number;
    hpDamage: number;
}