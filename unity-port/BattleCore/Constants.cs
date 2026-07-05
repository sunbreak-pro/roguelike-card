using System.Collections.Generic;

namespace BattleCore
{
    public static class Constants
    {
        public const int MaxStamina = 20;

        public static readonly IReadOnlyDictionary<RangeBand, int> StaminaRecovery =
            new Dictionary<RangeBand, int>
            {
                [RangeBand.Close] = 1,
                [RangeBand.Mid] = 2,
                [RangeBand.Far] = 3,
            };

        public const int FatigueThreshold = 8;
        public const double FatigueFloorMult = 0.4;

        public static readonly IReadOnlyList<double> RangeMult = new[] { 1.0, 0.5, 0.15 };

        public static readonly IReadOnlyList<RangeBand> RangeOrder = new[]
        {
            RangeBand.Close,
            RangeBand.Mid,
            RangeBand.Far,
        };

        public const int MidIndex = 1;

        public static readonly IReadOnlyDictionary<RangeBand, string> RangeLabel =
            new Dictionary<RangeBand, string>
            {
                [RangeBand.Close] = "近",
                [RangeBand.Mid] = "中",
                [RangeBand.Far] = "遠",
            };

        public const int PlayerMaxHp = 30;
        public const int EnemyMaxHp = 38;
        public const int HandSize = 3;
        public const int InitialDistanceIndex = MidIndex;
    }
}
