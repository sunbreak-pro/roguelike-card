using System;
using System.Collections.Generic;

namespace BattleCore
{
    public static class Enemy
    {
        public static readonly EnemyDef EnemyDef = new EnemyDef("長柄の歪み兵", Constants.EnemyMaxHp);

        public static readonly IReadOnlyDictionary<EnemyActionId, EnemyAction> EnemyActions =
            new Dictionary<EnemyActionId, EnemyAction>
            {
                [EnemyActionId.Sweep] = new EnemyAction(
                    EnemyActionId.Sweep, "薙ぎ払い", CardType.Attack, 5, RangeBand.Mid, 8, 0, false,
                    "キルゾーン（中）の主力。"),
                [EnemyActionId.ReachThrust] = new EnemyAction(
                    EnemyActionId.ReachThrust, "穂先の突き", CardType.Attack, 4, RangeBand.Far, 3, 0, false,
                    "遠間から届くが軽い牽制。"),
                [EnemyActionId.Shove] = new EnemyAction(
                    EnemyActionId.Shove, "石突きの押し込み", CardType.Attack, 3, RangeBand.Close, 2, 1, false,
                    "懐の相手を中間合いへ押し戻す。"),
                [EnemyActionId.Reposition] = new EnemyAction(
                    EnemyActionId.Reposition, "間合い取り直し", CardType.Move, 2, null, 0, 0, true,
                    "中間合いへ取り直す。"),
            };

        private const int CloseIndex = 0;
        private const int FarIndex = 2;

        public static EnemyAction? ChooseEnemyAction(int distanceIndex, int enemyStamina)
        {
            bool Can(EnemyAction a) => enemyStamina >= a.Cost;

            if (distanceIndex <= CloseIndex)
            {
                if (Can(EnemyActions[EnemyActionId.Shove])) return EnemyActions[EnemyActionId.Shove];
                if (Can(EnemyActions[EnemyActionId.Reposition])) return EnemyActions[EnemyActionId.Reposition];
                return null;
            }
            if (distanceIndex >= FarIndex)
            {
                if (Can(EnemyActions[EnemyActionId.ReachThrust])) return EnemyActions[EnemyActionId.ReachThrust];
                if (Can(EnemyActions[EnemyActionId.Reposition])) return EnemyActions[EnemyActionId.Reposition];
                return null;
            }
            if (Can(EnemyActions[EnemyActionId.Sweep])) return EnemyActions[EnemyActionId.Sweep];
            if (Can(EnemyActions[EnemyActionId.ReachThrust])) return EnemyActions[EnemyActionId.ReachThrust];
            return null;
        }

        private static int ResolveShift(EnemyAction action, int distanceIndex)
        {
            if (action.TowardMid) return Math.Sign(Constants.MidIndex - distanceIndex);
            return action.Shift;
        }

        public static EnemyOutcome ResolveEnemyTurn(int distanceIndex, int enemyStamina, int playerGuard)
        {
            var action = ChooseEnemyAction(distanceIndex, enemyStamina);
            if (action == null)
            {
                return new EnemyOutcome(
                    null, 0, 0, playerGuard, distanceIndex, 0,
                    $"敵「{EnemyDef.Name}」は息を整えた（休む）。");
            }

            int rawDamage = 0;
            if (action.Type == CardType.Attack && action.EffectiveRange.HasValue)
            {
                rawDamage = Combat.ComputeAttackDamage(
                    action.BasePower, action.EffectiveRange.Value, enemyStamina, distanceIndex);
            }
            int damage = Math.Max(0, rawDamage - playerGuard);
            int newGuard = Math.Max(0, playerGuard - rawDamage);
            int shift = ResolveShift(action, distanceIndex);
            int newDistanceIndex = Combat.ShiftDistance(distanceIndex, shift);

            string logText = $"敵「{EnemyDef.Name}」の{action.Name}。";
            if (action.Type == CardType.Attack)
            {
                logText += $" {damage} ダメージ";
                if (rawDamage > damage) logText += $"（ガードで {rawDamage - damage} 軽減）";
                logText += "。";
            }
            if (shift != 0)
            {
                logText += $" 間合いが「{Constants.RangeLabel[Combat.IndexToRange(newDistanceIndex)]}」に。";
            }

            return new EnemyOutcome(
                action, rawDamage, damage, newGuard, newDistanceIndex, action.Cost, logText);
        }
    }
}
