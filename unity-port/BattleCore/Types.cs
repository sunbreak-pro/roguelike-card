using System;
using System.Collections.Generic;

namespace BattleCore
{
    // ---- Enums (mirror the TS string-literal unions) ----

    public enum RangeBand
    {
        Close,
        Mid,
        Far,
    }

    public enum CardType
    {
        Attack,
        Move,
        Guard,
    }

    public enum CardDefId
    {
        Thrust,
        Lunge,
        Feint,
        StepIn,
        StepOut,
        Brace,
    }

    public enum EnemyActionId
    {
        Sweep,
        ReachThrust,
        Shove,
        Reposition,
    }

    public enum GameResult
    {
        Ongoing,
        Won,
        Lost,
    }

    /// <summary>
    /// Bidirectional conversions between enums and the exact TS string tokens.
    /// Needed for instanceId generation, log text, and parity-fixture comparison,
    /// which all rely on the original lowercase / snake_case string forms.
    /// </summary>
    public static class EnumTokens
    {
        public static string ToToken(this RangeBand band) => band switch
        {
            RangeBand.Close => "close",
            RangeBand.Mid => "mid",
            RangeBand.Far => "far",
            _ => throw new ArgumentOutOfRangeException(nameof(band), band, null),
        };

        public static RangeBand ToRangeBand(string token) => token switch
        {
            "close" => RangeBand.Close,
            "mid" => RangeBand.Mid,
            "far" => RangeBand.Far,
            _ => throw new ArgumentException($"Unknown RangeBand token '{token}'", nameof(token)),
        };

        public static string ToToken(this CardType type) => type switch
        {
            CardType.Attack => "attack",
            CardType.Move => "move",
            CardType.Guard => "guard",
            _ => throw new ArgumentOutOfRangeException(nameof(type), type, null),
        };

        public static CardType ToCardType(string token) => token switch
        {
            "attack" => CardType.Attack,
            "move" => CardType.Move,
            "guard" => CardType.Guard,
            _ => throw new ArgumentException($"Unknown CardType token '{token}'", nameof(token)),
        };

        public static string ToToken(this CardDefId defId) => defId switch
        {
            CardDefId.Thrust => "thrust",
            CardDefId.Lunge => "lunge",
            CardDefId.Feint => "feint",
            CardDefId.StepIn => "step_in",
            CardDefId.StepOut => "step_out",
            CardDefId.Brace => "brace",
            _ => throw new ArgumentOutOfRangeException(nameof(defId), defId, null),
        };

        public static string ToToken(this EnemyActionId id) => id switch
        {
            EnemyActionId.Sweep => "sweep",
            EnemyActionId.ReachThrust => "reach_thrust",
            EnemyActionId.Shove => "shove",
            EnemyActionId.Reposition => "reposition",
            _ => throw new ArgumentOutOfRangeException(nameof(id), id, null),
        };

        public static string ToToken(this GameResult result) => result switch
        {
            GameResult.Ongoing => "ongoing",
            GameResult.Won => "won",
            GameResult.Lost => "lost",
            _ => throw new ArgumentOutOfRangeException(nameof(result), result, null),
        };

        public static GameResult ToGameResult(string token) => token switch
        {
            "ongoing" => GameResult.Ongoing,
            "won" => GameResult.Won,
            "lost" => GameResult.Lost,
            _ => throw new ArgumentException($"Unknown GameResult token '{token}'", nameof(token)),
        };
    }

    // ---- Immutable data records (mirror the TS interfaces) ----

    public sealed record PrototypeCard(
        string InstanceId,
        CardDefId DefId,
        string Name,
        CardType Type,
        int Cost,
        RangeBand? EffectiveRange,
        int BasePower,
        int Shift,
        int Guard,
        string Description);

    public sealed record EnemyAction(
        EnemyActionId Id,
        string Name,
        CardType Type,
        int Cost,
        RangeBand? EffectiveRange,
        int BasePower,
        int Shift,
        bool TowardMid,
        string Description);

    public sealed record EnemyDef(string Name, int MaxHp);

    public sealed record EnemyOutcome(
        EnemyAction? Action,
        int RawDamage,
        int Damage,
        int NewGuard,
        int NewDistanceIndex,
        int StaminaSpent,
        string LogText);

    public sealed record LogEntry(int Id, string Text);

    public sealed record BattleState(
        int Turn,
        int DistanceIndex,
        int PlayerHp,
        int PlayerStamina,
        int PlayerGuard,
        int EnemyHp,
        int EnemyStamina,
        IReadOnlyList<PrototypeCard> Hand,
        IReadOnlyList<PrototypeCard> DrawPile,
        IReadOnlyList<PrototypeCard> DiscardPile,
        IReadOnlyList<LogEntry> Log,
        int LogSeq,
        GameResult Result);

    // ---- Battle actions (discriminated union) ----

    public abstract record BattleAction;

    public sealed record PlayCardAction(string InstanceId) : BattleAction;

    public sealed record EndTurnAction : BattleAction;

    public sealed record RestartAction : BattleAction;
}
