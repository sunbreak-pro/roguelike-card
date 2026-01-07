# Battle UI Redesign Plan

## Overview
バトル画面のUIを改善し、より視認性の高いデザインに変更する。

---

## 1. Energy UI - Orb to Bar Conversion

### Current State
- **Player**: `.energy-orbs` - 3.5vh径の円形オーブ（BattleScreen.tsx:220-231）
- **Enemy**: `.enemy-energy-orbs` - 1.4vh径の円形オーブ（EnemyDisplay.tsx:147-152）

### Proposed Design
```
[HP Bar                              ]
[Energy Bar  ████████░░░░  3/5       ]
```

### Changes Required
**Files:**
- `src/ui/battleUI/BattleScreen.tsx` - Player energy display
- `src/ui/enemyUI/EnemyDisplay.tsx` - Enemy energy display
- `src/ui/css/BattleScreen.css` - Energy bar styles

**Implementation:**
- Replace orb array with horizontal bar
- Width: percentage based on current/max energy
- Position: directly below HP bar
- Height: 1.2vh (slimmer than HP bar)
- Color: Theme accent gradient

---

## 2. AP Bar Overlay on HP Bar

### Current State
- HP and AP are separate horizontal bars (BattleScreen.tsx:194-216)
- HP numbers displayed as separate label

### Proposed Design
```
┌─────────────────────────────────────┐
│ ████████████████░░░░░░░░░  75/100   │  <- HP Bar (red)
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░          │  <- AP Bar overlay (orange, semi-transparent)
└─────────────────────────────────────┘
```

### Changes Required
**Files:**
- `src/ui/battleUI/BattleScreen.tsx` - Player HP/AP display
- `src/ui/enemyUI/EnemyDisplay.tsx` - Enemy HP/AP display
- `src/ui/css/BattleScreen.css` - Bar overlay styles

**Implementation:**
- Wrap HP and AP in single container with `position: relative`
- AP bar: `position: absolute`, bottom-aligned, 30% opacity
- HP numbers: centered inside HP bar with text shadow for readability
- Remove separate label row

---

## 3. Enemy Action Icon with Hover Details

### Current State
- Full tooltip appears on enemy hover (EnemyDisplay.tsx:74-104)
- Shows action name, damage, guard, debuffs

### Proposed Design
```
[Enemy Name] [⚔️]     <- Icon only, next to name
               │
               └─ Hover shows detailed tooltip
```

### Icon Mapping (4 Types - Custom SVG)
| Action Type | Icon | Condition |
|-------------|------|-----------|
| Attack      | `action-attack.svg` | `baseDamage > 0` |
| Guard       | `action-guard.svg` | `guardGain > 0 && !baseDamage` |
| Debuff      | `action-debuff.svg` | `applyDebuffs.length > 0` |
| Special     | `action-special.svg` | その他/複合効果 |

**Icon Assets Required:**
- `src/assets/icons/action-attack.svg`
- `src/assets/icons/action-guard.svg`
- `src/assets/icons/action-debuff.svg`
- `src/assets/icons/action-special.svg`

### Changes Required
**Files:**
- `src/ui/enemyUI/EnemyDisplay.tsx` - Icon display + hover logic
- `src/ui/css/BattleScreen.css` - Icon and tooltip styles

**Implementation:**
- Add action icon next to `.enemy-name`
- Icon shows action type at glance
- Hover on icon triggers detailed tooltip
- Remove enemy hover trigger from `.enemy-visual`

---

## 4. TurnOrderIndicator Simplification

### Current State
- Vertical layout with speed values (TurnOrderIndicator.tsx)
- Shows: header, speed comparison, bonus indicators
- Position: top-right corner

### Proposed Design
```
┌──────────────────────────────────────┐
│  [P]  →  [E]  →  [P]  →  [E]        │  (2-4 phases displayed)
└──────────────────────────────────────┘
```

### Changes Required
**Files:**
- `src/ui/commonUI/TurnOrderIndicator.tsx` - Component rewrite
- `src/ui/css/TurnOrderIndicator.css` - New horizontal styles
- `src/assets/icons/` - Custom SVG icons (NEW)

**Implementation:**
- Horizontal flex layout
- **Custom SVG icons** for Player and Enemy
- Display **2-4 phases** from PhaseQueue
- Arrow separators between icons
- Current actor highlighted (glow effect)
- Remove: speed values, bonus indicators, "先攻" label
- Size: slim horizontal bar (3vh height max)

**Icon Assets Required:**
- `player-icon.svg` - Player turn indicator
- `enemy-icon.svg` - Enemy turn indicator

---

## File Modification Summary

| File | Changes |
|------|---------|
| `src/ui/battleUI/BattleScreen.tsx` | Energy bar, HP/AP overlay |
| `src/ui/enemyUI/EnemyDisplay.tsx` | Action icon, Energy bar |
| `src/ui/commonUI/TurnOrderIndicator.tsx` | Full rewrite (horizontal icons) |
| `src/ui/css/BattleScreen.css` | Energy bar styles, HP/AP overlay |
| `src/ui/css/TurnOrderIndicator.css` | Horizontal layout styles |

### New Files (Icon Assets)
| File | Description |
|------|-------------|
| `src/assets/icons/player-icon.svg` | Turn indicator - Player |
| `src/assets/icons/enemy-icon.svg` | Turn indicator - Enemy |
| `src/assets/icons/action-attack.svg` | Enemy action - Attack |
| `src/assets/icons/action-guard.svg` | Enemy action - Guard |
| `src/assets/icons/action-debuff.svg` | Enemy action - Debuff |
| `src/assets/icons/action-special.svg` | Enemy action - Special |

---

## Visual Mockup (ASCII)

### Player Status Area (Left)
```
┌─ Player Name ─────────────────────┐
│ ████████████████░░░░░░░░  75/100  │ HP (red) + AP overlay
│ ████████████░░░░░░░░░░░░    3/5   │ Energy bar (theme)
│ [Buff] [Debuff]                   │ Status effects
└───────────────────────────────────┘
```

### Enemy Status Area (Right)
```
┌─ Enemy Name [⚔] ──────────────────┐  <- Action icon (SVG)
│ ████████████████░░░░░░░░  50/80   │ HP + AP overlay
│ ██████████░░░░░░░░░░░░░░    2/3   │ Energy bar
│ [Debuff]                          │ Status effects
└───────────────────────────────────┘
```

### Turn Order Indicator (Top Right)
```
┌─────────────────────────────────────┐
│  [P●] → [E] → [P] → [E]            │  (2-4 phases, current highlighted)
└─────────────────────────────────────┘
```

---

## Implementation Status

1. **Phase 1**: HP/AP overlay - COMPLETE
2. **Phase 2**: Energy bar conversion - COMPLETE
3. **Phase 3**: TurnOrderIndicator horizontal - COMPLETE
4. **Phase 4**: Enemy action icon + hover - COMPLETE
5. **Phase 5**: SVG icon creation - USER TASK (see below)

---

## Phase 5: SVG Icon Creation Guide (For User)

### Required Icon Files

| File Path | Size | Usage |
|-----------|------|-------|
| `src/assets/icons/player-icon.svg` | 24x24px | TurnOrderIndicator - Player |
| `src/assets/icons/enemy-icon.svg` | 24x24px | TurnOrderIndicator - Enemy |
| `src/assets/icons/action-attack.svg` | 20x20px | Enemy Action - Attack |
| `src/assets/icons/action-guard.svg` | 20x20px | Enemy Action - Guard |
| `src/assets/icons/action-debuff.svg` | 20x20px | Enemy Action - Debuff |
| `src/assets/icons/action-special.svg` | 20x20px | Enemy Action - Special |

### Color Recommendations

| Icon Type | Primary Color | Glow Color |
|-----------|---------------|------------|
| Player | #4a9d6d (green) | rgba(74, 157, 109, 0.8) |
| Enemy | #dc3545 (red) | rgba(220, 53, 69, 0.8) |
| Attack | #dc3545 (red) | - |
| Guard | #4488cc (blue) | - |
| Debuff | #9933cc (purple) | - |
| Special | #ffaa00 (gold) | - |

### Integration Points

**TurnOrderIndicator.tsx** (lines 18-30):
```tsx
// Replace placeholder with:
import playerIconSvg from "../../assets/icons/player-icon.svg";
import enemyIconSvg from "../../assets/icons/enemy-icon.svg";

// In PlayerIcon component:
<img src={playerIconSvg} alt="Player" className="phase-icon-img" />
```

**EnemyDisplay.tsx** (lines 20-33):
```tsx
// Replace placeholder with:
import attackIcon from "../../assets/icons/action-attack.svg";
import guardIcon from "../../assets/icons/action-guard.svg";
import debuffIcon from "../../assets/icons/action-debuff.svg";
import specialIcon from "../../assets/icons/action-special.svg";

// In ActionIcon component:
const iconSrcMap: Record<ActionType, string> = {
  attack: attackIcon,
  guard: guardIcon,
  debuff: debuffIcon,
  special: specialIcon,
};
<img src={iconSrcMap[type]} alt={type} className="action-icon-img" />
```

### Current Placeholder Status

- TurnOrderIndicator: Shows "P" / "E" text
- Enemy Action: Shows emoji ⚔ / 🛡 / 💀 / ✨
