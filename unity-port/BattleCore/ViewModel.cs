using System.Collections.Generic;
using System.Linq;

namespace BattleCore
{
    public sealed record CardDamageView(
        int BasePower,
        int Predicted,
        bool OffRange,
        bool Fatigued,
        string Note,
        string Text);

    public sealed record CardView(
        string InstanceId,
        string Name,
        CardType Type,
        int Cost,
        string Description,
        bool Playable,
        string DisabledReason,
        string? EffectiveRangeLabel,
        CardDamageView? Damage,
        int Guard,
        int Shift,
        string? ShiftLabel);

    public static class ViewModel
    {
        private const string OptimalNote = "最適";
        private const string OffRangeNote = "間合い不適";
        private const string FatigueNote = "疲労";

        private static CardDamageView DescribeDamage(
            int basePower, RangeBand effectiveRange, int playerStamina, int distanceIndex)
        {
            int predicted = Combat.ComputeAttackDamage(basePower, effectiveRange, playerStamina, distanceIndex);
            bool offRange = Combat.RangeMultiplier(distanceIndex, effectiveRange) < 1;
            bool fatigued = Combat.StaminaDamageMultiplier(playerStamina) < 1;
            var tags = new List<string>();
            if (offRange) tags.Add(OffRangeNote);
            if (fatigued) tags.Add(FatigueNote);
            string note = tags.Count > 0 ? string.Join("・", tags) : OptimalNote;
            return new CardDamageView(
                basePower, predicted, offRange, fatigued, note,
                $"威力 {basePower} → {predicted}（{note}）");
        }

        private static string? DescribeShift(int shift)
        {
            if (shift == 0) return null;
            return shift < 0 ? "間合い −1（詰める）" : "間合い +1（退く）";
        }

        public static CardView DescribeCard(
            PrototypeCard card, int playerStamina, int distanceIndex, bool battleOver)
        {
            bool affordable = playerStamina >= card.Cost;
            bool playable = affordable && !battleOver;
            string disabledReason = !affordable ? $"気力不足（必要 {card.Cost}）" : "";
            CardDamageView? damage =
                card.Type == CardType.Attack && card.EffectiveRange.HasValue
                    ? DescribeDamage(card.BasePower, card.EffectiveRange.Value, playerStamina, distanceIndex)
                    : null;
            return new CardView(
                InstanceId: card.InstanceId,
                Name: card.Name,
                Type: card.Type,
                Cost: card.Cost,
                Description: card.Description,
                Playable: playable,
                DisabledReason: disabledReason,
                EffectiveRangeLabel: card.EffectiveRange.HasValue
                    ? Constants.RangeLabel[card.EffectiveRange.Value]
                    : null,
                Damage: damage,
                Guard: card.Guard,
                Shift: card.Shift,
                ShiftLabel: DescribeShift(card.Shift));
        }

        public static IReadOnlyList<CardView> DescribeHand(BattleState state)
        {
            bool battleOver = IsBattleOver(state.Result);
            return state.Hand
                .Select(card => DescribeCard(card, state.PlayerStamina, state.DistanceIndex, battleOver))
                .ToList();
        }

        public static string DistanceLabel(int distanceIndex)
        {
            return Constants.RangeLabel[Combat.IndexToRange(distanceIndex)];
        }

        public static bool IsBattleOver(GameResult result)
        {
            return result != GameResult.Ongoing;
        }

        public static string EnemyRangeHint()
        {
            // Object.values(ENEMY_ACTIONS) in TS preserves key insertion order.
            var order = new[]
            {
                EnemyActionId.Sweep,
                EnemyActionId.ReachThrust,
                EnemyActionId.Shove,
                EnemyActionId.Reposition,
            };
            var threats = order
                .Select(id => Enemy.EnemyActions[id])
                .Where(a => a.Type == CardType.Attack
                            && a.EffectiveRange.HasValue
                            && a.EffectiveRange.Value != RangeBand.Close);
            var parts = threats.Select(a => $"{Constants.RangeLabel[a.EffectiveRange!.Value]}（{a.Name}）");
            return $"有効間合い: {string.Join(" / ", parts)}。近に詰めると弱い押し戻ししかできない。";
        }
    }
}
