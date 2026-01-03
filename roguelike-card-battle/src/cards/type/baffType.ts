export type BuffDebuffType =
  // Debuff - DoT (Damage over Time)
  | "bleed" // Bleed (3% maxHP per card use)
  | "poison" // Poison (5 damage at turn end)
  | "burn" // Burn (3 damage at turn end)
  | "curse" // Curse (healing -20%)
  | "overCurse" // Heavy Curse (healing -50%)
  // Debuff - Status
  | "stun" // Stun (cannot act)
  // Debuff - Stat reduction (Minor/Major tiers)
  | "atkDownMinor" // Minor Attack Down (-15%)
  | "atkDownMajor" // Major Attack Down (-30%)
  | "defDownMinor" // Minor Defense Down (-15%)
  | "defDownMajor" // Major Defense Down (-30%)
  | "slow" // Slow (speed -10)
  | "stall" // Stall (speed -15)

  // Buff - Stat increase (Minor/Major tiers)
  | "atkUpMinor" // Minor Attack Up (+15%)
  | "atkUpMajor" // Major Attack Up (+30%)
  | "defUpMinor" // Minor Defense Up (+15%)
  | "defUpMajor" // Major Defense Up (+30%)
  | "penetrationUp" // Penetration Up (+30%)
  | "hitRateUp" // Hit Rate Up (+15%)
  | "criticalUp" // Critical Up (+15%)
  | "haste" // Haste (speed +15)
  | "superFast" // Super Fast (speed +30)
  // Buff - Heal/Defense
  | "regeneration" // Regeneration (5 HP per turn)
  | "shieldRegen" // Iron Stance (5 Guard per turn)
  | "reflect" // Reflect (30% damage reflection)
  | "immunity" // Immunity (debuff immune)
  // Buff - Resource management
  | "energyRegen" // Energy Regen (+1)
  | "drawPower" // Draw Power (+1 card)
  | "costReduction" // Cost Reduction (-1)
  // Buff - Combat style
  | "lifesteal" // Lifesteal (30% damage as heal)
  | "doubleStrike" // Double Strike (attack twice at 50% power)
  // Buff - Swordsman specific
  | "swordEnergyGain" // Sword Energy Amplify (+50%)
  // Buff - Mage specific
  | "elementalMastery" // Elemental Mastery (+30%)
  | "fireField" // Fire Field (fire effects +50%)
  | "electroField" // Electric Field (+20 damage per lightning card)
  // Buff - Summoner specific
  | "summonPower" // Summon Power (+30%)
  | "sacrificeBonus" // Sacrifice Bonus (+30%)
  // Buff - Special effects
  | "focus" // Focus (next card +50%)
  | "momentum" // Momentum (+5% attack per card used)
  | "cleanse" // Cleanse (remove 1 debuff per turn)
  | "tenacity" // Tenacity (all stats +30% when HP < 30%)
  | "lastStand"; // Last Stand (survive lethal once)

/**
 * Buff/debuff effect value definitions
 * Cards reference these values, no individual value specification needed
 */
export interface BuffEffectDefinition {
  name: string; // Display name
  value: number; // Effect value (% or flat)
  isDebuff: boolean; // Is debuff
  isPercentage: boolean; // Is percentage or flat
  stackable: boolean; // Can stack (false = duration refresh only)
  description(): string; // Effect description
}

export const BUFF_EFFECTS: Record<BuffDebuffType, BuffEffectDefinition> = {
  // === Debuff - DoT ===
  bleed: { name: "Bleed", value: 3, isDebuff: true, isPercentage: true, stackable: true, description: () => `${BUFF_EFFECTS.bleed.value}% maxHP damage per card use` },
  poison: { name: "Poison", value: 5, isDebuff: true, isPercentage: false, stackable: true, description: () => `${BUFF_EFFECTS.poison.value} damage at turn end` },
  burn: { name: "Burn", value: 3, isDebuff: true, isPercentage: false, stackable: true, description: () => `${BUFF_EFFECTS.burn.value} damage at turn end` },
  curse: { name: "Curse", value: 20, isDebuff: true, isPercentage: true, stackable: true, description: () => `Healing -${BUFF_EFFECTS.curse.value}%` },
  overCurse: { name: "Heavy Curse", value: 50, isDebuff: true, isPercentage: true, stackable: true, description: () => `Healing -${BUFF_EFFECTS.overCurse.value}%` },
  // === Debuff - Status ===
  stun: { name: "Stun", value: 100, isDebuff: true, isPercentage: true, stackable: true, description: () => "Cannot act" },

  // === Debuff - Stat reduction (Minor/Major) ===
  atkDownMinor: { name: "Minor Atk Down", value: 15, isDebuff: true, isPercentage: true, stackable: false, description: () => `Attack -${BUFF_EFFECTS.atkDownMinor.value}%` },
  atkDownMajor: { name: "Major Atk Down", value: 30, isDebuff: true, isPercentage: true, stackable: false, description: () => `Attack -${BUFF_EFFECTS.atkDownMajor.value}%` },
  defDownMinor: { name: "Minor Def Down", value: 15, isDebuff: true, isPercentage: true, stackable: false, description: () => `Defense -${BUFF_EFFECTS.defDownMinor.value}%` },
  defDownMajor: { name: "Major Def Down", value: 30, isDebuff: true, isPercentage: true, stackable: false, description: () => `Defense -${BUFF_EFFECTS.defDownMajor.value}%` },
  slow: { name: "Slow", value: 10, isDebuff: true, isPercentage: false, stackable: true, description: () => `Speed -${BUFF_EFFECTS.slow.value}` },
  stall: { name: "Stall", value: 15, isDebuff: true, isPercentage: true, stackable: true, description: () => `Speed -${BUFF_EFFECTS.stall.value}` },

  // === Buff - Stat increase (Minor/Major) ===
  atkUpMinor: { name: "Minor Atk Up", value: 15, isDebuff: false, isPercentage: true, stackable: false, description: () => `Attack +${BUFF_EFFECTS.atkUpMinor.value}%` },
  atkUpMajor: { name: "Major Atk Up", value: 30, isDebuff: false, isPercentage: true, stackable: false, description: () => `Attack +${BUFF_EFFECTS.atkUpMajor.value}%` },
  defUpMinor: { name: "Minor Def Up", value: 15, isDebuff: false, isPercentage: true, stackable: false, description: () => `Defense +${BUFF_EFFECTS.defUpMinor.value}%` },
  defUpMajor: { name: "Major Def Up", value: 30, isDebuff: false, isPercentage: true, stackable: false, description: () => `Defense +${BUFF_EFFECTS.defUpMajor.value}%` },
  penetrationUp: { name: "Penetration Up", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `Penetration +${BUFF_EFFECTS.penetrationUp.value}%` },
  hitRateUp: { name: "Hit Rate Up", value: 15, isDebuff: false, isPercentage: true, stackable: true, description: () => `Hit rate +${BUFF_EFFECTS.hitRateUp.value}%` },
  criticalUp: { name: "Critical Up", value: 15, isDebuff: false, isPercentage: true, stackable: true, description: () => `Critical damage +${BUFF_EFFECTS.criticalUp.value}%` },
  haste: { name: "Haste", value: 15, isDebuff: false, isPercentage: true, stackable: true, description: () => `Speed +${BUFF_EFFECTS.haste.value}` },
  superFast: { name: "Super Fast", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `Speed +${BUFF_EFFECTS.superFast.value}` },
  // === Buff - Heal/Guard ===
  regeneration: { name: "Regeneration", value: 5, isDebuff: false, isPercentage: false, stackable: true, description: () => `Heal ${BUFF_EFFECTS.regeneration.value} HP per turn` },
  shieldRegen: { name: "Iron Stance", value: 5, isDebuff: false, isPercentage: false, stackable: true, description: () => `Guard +${BUFF_EFFECTS.shieldRegen.value} per turn` },
  reflect: { name: "Reflect", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `Reflect ${BUFF_EFFECTS.reflect.value}% damage` },
  immunity: { name: "Immunity", value: 1, isDebuff: false, isPercentage: false, stackable: true, description: () => "Immune to damage" },
  // === Buff - Resource management ===
  energyRegen: { name: "Energy Regen", value: 1, isDebuff: false, isPercentage: false, stackable: true, description: () => `Energy +${BUFF_EFFECTS.energyRegen.value}` },
  drawPower: { name: "Draw Power", value: 1, isDebuff: false, isPercentage: false, stackable: true, description: () => "Draw +1 card" },
  costReduction: { name: "Cost Reduction", value: 1, isDebuff: false, isPercentage: false, stackable: true, description: () => "Cost -1" },
  // === Buff - Combat style ===
  lifesteal: { name: "Lifesteal", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `Heal ${BUFF_EFFECTS.lifesteal.value}% of damage dealt` },
  doubleStrike: { name: "Double Strike", value: 50, isDebuff: false, isPercentage: true, stackable: true, description: () => "Next ATK card triggers twice" },

  // === Buff - Swordsman ===
  swordEnergyGain: { name: "Sword Energy Amp", value: 3, isDebuff: false, isPercentage: true, stackable: true, description: () => `Sword energy gain +${BUFF_EFFECTS.swordEnergyGain.value}%` },
  // === Buff - Mage ===
  elementalMastery: { name: "Elemental Mastery", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `Elemental damage +${BUFF_EFFECTS.elementalMastery.value}%` },
  fireField: { name: "Fire Field", value: 50, isDebuff: false, isPercentage: true, stackable: true, description: () => `Fire card effects +${BUFF_EFFECTS.fireField.value}%` },
  electroField: { name: "Electric Field", value: 10, isDebuff: false, isPercentage: true, stackable: true, description: () => `+${BUFF_EFFECTS.electroField.value} damage per lightning card` },
  // === Buff - Summoner ===
  summonPower: { name: "Summon Power", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `Summon power +${BUFF_EFFECTS.summonPower.value}%` },
  sacrificeBonus: { name: "Sacrifice Bonus", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `Sacrifice effect +${BUFF_EFFECTS.sacrificeBonus.value}%` },

  // === Buff - Special ===
  focus: { name: "Focus", value: 50, isDebuff: false, isPercentage: true, stackable: true, description: () => `Next card effect +${BUFF_EFFECTS.focus.value}%` },
  momentum: { name: "Momentum", value: 5, isDebuff: false, isPercentage: true, stackable: true, description: () => `Attack +${BUFF_EFFECTS.momentum.value}% per card used` },
  cleanse: { name: "Cleanse", value: 1, isDebuff: false, isPercentage: false, stackable: true, description: () => "Remove 1 debuff at turn end" },
  tenacity: { name: "Tenacity", value: 30, isDebuff: false, isPercentage: true, stackable: true, description: () => `All stats +${BUFF_EFFECTS.tenacity.value}% when HP < 30%` },
  lastStand: { name: "Last Stand", value: 1, isDebuff: false, isPercentage: false, stackable: true, description: () => "Survive lethal damage once" },
};

/**
 * Get buff/debuff effect value
 */
export function getBuffValue(type: BuffDebuffType): number {
  return BUFF_EFFECTS[type].value;
}

/**
 * Check if buff/debuff is stackable
 */
export function isStackable(type: BuffDebuffType): boolean {
  return BUFF_EFFECTS[type].stackable;
}

/**
 * Card buff/debuff specification (without value)
 * Effect values are auto-fetched from BUFF_EFFECTS
 */
export interface CardBuffSpec {
  name: BuffDebuffType;
  duration: number; // Duration in turns
  stacks: number; // Stack count (ignored if stackable=false)
  isPermanent?: boolean; // Is permanent (default: false)
}

/**
 * Runtime buff/debuff state (includes value)
 */
export interface BuffDebuffState {
  name: BuffDebuffType;
  stacks: number; // Stack count (always 1 if stackable=false)
  duration: number; // Remaining turns (-1 for permanent)
  value: number; // Effect value (from BUFF_EFFECTS)
  isPermanent: boolean; // Is permanent
  source?: string; // Source (card ID etc)
}

// Buff/Debuff map type
export type BuffDebuffMap = Map<BuffDebuffType, BuffDebuffState>;

/**
 * Convert CardBuffSpec to BuffDebuffState
 * Value is auto-fetched from BUFF_EFFECTS
 * Stacks is fixed to 1 if stackable=false
 */
export function createBuffState(buff: CardBuffSpec, source?: string): BuffDebuffState {
  const effectDef = BUFF_EFFECTS[buff.name];
  return {
    name: buff.name,
    stacks: effectDef.stackable ? buff.stacks : 1,
    duration: buff.duration,
    value: effectDef.value,
    isPermanent: buff.isPermanent ?? false,
    source,
  };
}
