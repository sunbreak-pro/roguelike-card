using System;
using System.Collections.Generic;

namespace BattleCore
{
    public static class Combat
    {
        public static int RangeToIndex(RangeBand band)
        {
            IReadOnlyList<RangeBand> order = Constants.RangeOrder;
            for (int i = 0; i < order.Count; i++)
            {
                if (order[i] == band) return i;
            }
            return -1;
        }

        public static int ClampDistance(int index)
        {
            int max = Constants.RangeOrder.Count - 1;
            if (index < 0) return 0;
            return index > max ? max : index;
        }

        public static RangeBand IndexToRange(int index)
        {
            return Constants.RangeOrder[ClampDistance(index)];
        }

        public static int ShiftDistance(int currentIndex, int shift)
        {
            return ClampDistance(currentIndex + shift);
        }

        public static int StaminaRecovery(RangeBand band)
        {
            return Constants.StaminaRecovery[band];
        }

        public static double StaminaDamageMultiplier(int stamina)
        {
            if (stamina >= Constants.FatigueThreshold) return 1;
            return Math.Max(Constants.FatigueFloorMult, (double)stamina / Constants.FatigueThreshold);
        }

        public static double RangeMultiplier(int distanceIndex, RangeBand effRange)
        {
            int diff = Math.Abs(ClampDistance(distanceIndex) - RangeToIndex(effRange));
            int idx = Math.Min(diff, Constants.RangeMult.Count - 1);
            return Constants.RangeMult[idx];
        }

        public static int ComputeAttackDamage(
            int basePower,
            RangeBand effRange,
            int attackerStamina,
            int distanceIndex)
        {
            double raw =
                basePower *
                RangeMultiplier(distanceIndex, effRange) *
                StaminaDamageMultiplier(attackerStamina);
            // JS Math.round rounds .5 up (away from zero for non-negative values).
            // C# Math.Round defaults to banker's rounding, so force AwayFromZero.
            return Math.Max(0, (int)Math.Round(raw, MidpointRounding.AwayFromZero));
        }
    }
}
