using System;
using System.Collections.Generic;
using System.Linq;

namespace BattleCore
{
    public static class BattleReducer
    {
        private readonly struct LogAppend
        {
            public LogAppend(IReadOnlyList<LogEntry> log, int logSeq)
            {
                Log = log;
                LogSeq = logSeq;
            }

            public IReadOnlyList<LogEntry> Log { get; }
            public int LogSeq { get; }
        }

        private static LogAppend AppendLogs(
            IReadOnlyList<LogEntry> log, int logSeq, IReadOnlyList<string> texts)
        {
            var newLog = new List<LogEntry>(log);
            for (int i = 0; i < texts.Count; i++)
            {
                newLog.Add(new LogEntry(logSeq + i, texts[i]));
            }
            return new LogAppend(newLog, logSeq + texts.Count);
        }

        public static BattleState InitState(IRng rng)
        {
            var shuffled = Cards.Shuffle(Cards.CreateInitialDeck(), rng);
            var drawn = Cards.DrawToHandSize(
                shuffled, new List<PrototypeCard>(), new List<PrototypeCard>(), Constants.HandSize, rng);

            var baseState = new BattleState(
                Turn: 1,
                DistanceIndex: Constants.InitialDistanceIndex,
                PlayerHp: Constants.PlayerMaxHp,
                PlayerStamina: Constants.MaxStamina,
                PlayerGuard: 0,
                EnemyHp: Enemy.EnemyDef.MaxHp,
                EnemyStamina: Constants.MaxStamina,
                Hand: drawn.Hand,
                DrawPile: drawn.DrawPile,
                DiscardPile: drawn.DiscardPile,
                Log: new List<LogEntry>(),
                LogSeq: 0,
                Result: GameResult.Ongoing);

            var appended = AppendLogs(baseState.Log, baseState.LogSeq, new[]
            {
                $"戦闘開始。間合いは「{Constants.RangeLabel[Combat.IndexToRange(baseState.DistanceIndex)]}」。",
            });
            return baseState with { Log = appended.Log, LogSeq = appended.LogSeq };
        }

        private static BattleState PlayCard(BattleState state, string instanceId)
        {
            if (state.Result != GameResult.Ongoing) return state;
            var card = state.Hand.FirstOrDefault(c => c.InstanceId == instanceId);
            if (card == null) return state;
            if (state.PlayerStamina < card.Cost) return state;

            var logs = new List<string>();
            int enemyHp = state.EnemyHp;
            int distanceIndex = state.DistanceIndex;
            int playerGuard = state.PlayerGuard;

            if (card.Type == CardType.Attack && card.EffectiveRange.HasValue)
            {
                int dmg = Combat.ComputeAttackDamage(
                    card.BasePower, card.EffectiveRange.Value, state.PlayerStamina, state.DistanceIndex);
                enemyHp = Math.Max(0, enemyHp - dmg);
                logs.Add($"「{card.Name}」で {dmg} ダメージ。");
            }
            else if (card.Type == CardType.Guard)
            {
                playerGuard += card.Guard;
                logs.Add($"「{card.Name}」で受けを固めた（ガード +{card.Guard}）。");
            }
            else
            {
                logs.Add($"「{card.Name}」を使った。");
            }

            if (card.Shift != 0)
            {
                distanceIndex = Combat.ShiftDistance(distanceIndex, card.Shift);
                logs.Add($"間合いが「{Constants.RangeLabel[Combat.IndexToRange(distanceIndex)]}」に。");
            }

            int playerStamina = state.PlayerStamina - card.Cost;
            var hand = state.Hand.Where(c => c.InstanceId != instanceId).ToList();
            var discardPile = new List<PrototypeCard>(state.DiscardPile) { card };

            var result = state.Result;
            if (enemyHp <= 0)
            {
                result = GameResult.Won;
                logs.Add($"敵「{Enemy.EnemyDef.Name}」を打ち倒した。勝利。");
            }

            var appended = AppendLogs(state.Log, state.LogSeq, logs);
            return state with
            {
                EnemyHp = enemyHp,
                DistanceIndex = distanceIndex,
                PlayerGuard = playerGuard,
                PlayerStamina = playerStamina,
                Hand = hand,
                DiscardPile = discardPile,
                Result = result,
                Log = appended.Log,
                LogSeq = appended.LogSeq,
            };
        }

        private static BattleState EndTurn(BattleState state, IRng rng)
        {
            if (state.Result != GameResult.Ongoing) return state;
            var logs = new List<string>();
            var discardAfterHand = new List<PrototypeCard>(state.DiscardPile);
            discardAfterHand.AddRange(state.Hand);

            var enemyBand = Combat.IndexToRange(state.DistanceIndex);
            int enemyRecovery = Combat.StaminaRecovery(enemyBand);
            int enemyStaminaAfterRecovery = Math.Min(Constants.MaxStamina, state.EnemyStamina + enemyRecovery);
            logs.Add(
                $"敵が間合い「{Constants.RangeLabel[enemyBand]}」でスタミナ回復（+{enemyRecovery} → {enemyStaminaAfterRecovery}）。");

            var outcome = Enemy.ResolveEnemyTurn(state.DistanceIndex, enemyStaminaAfterRecovery, state.PlayerGuard);
            int enemyStamina = enemyStaminaAfterRecovery - outcome.StaminaSpent;
            int playerHp = Math.Max(0, state.PlayerHp - outcome.Damage);
            int distanceIndex = outcome.NewDistanceIndex;
            logs.Add(outcome.LogText);

            if (playerHp <= 0)
            {
                logs.Add("力尽きた。敗北。");
                var appendedLost = AppendLogs(state.Log, state.LogSeq, logs);
                return state with
                {
                    Hand = new List<PrototypeCard>(),
                    DiscardPile = discardAfterHand,
                    EnemyStamina = enemyStamina,
                    PlayerHp = playerHp,
                    PlayerGuard = outcome.NewGuard,
                    DistanceIndex = distanceIndex,
                    Result = GameResult.Lost,
                    Log = appendedLost.Log,
                    LogSeq = appendedLost.LogSeq,
                };
            }

            int turn = state.Turn + 1;
            var playerBand = Combat.IndexToRange(distanceIndex);
            int playerRecovery = Combat.StaminaRecovery(playerBand);
            int playerStamina = Math.Min(Constants.MaxStamina, state.PlayerStamina + playerRecovery);
            var drawn = Cards.DrawToHandSize(
                state.DrawPile, discardAfterHand, new List<PrototypeCard>(), Constants.HandSize, rng);
            logs.Add(
                $"ターン{turn}開始。間合い「{Constants.RangeLabel[playerBand]}」でスタミナ回復（+{playerRecovery} → {playerStamina}）。");

            var appended = AppendLogs(state.Log, state.LogSeq, logs);
            return state with
            {
                Turn = turn,
                DistanceIndex = distanceIndex,
                PlayerHp = playerHp,
                PlayerStamina = playerStamina,
                PlayerGuard = 0,
                EnemyStamina = enemyStamina,
                Hand = drawn.Hand,
                DrawPile = drawn.DrawPile,
                DiscardPile = drawn.DiscardPile,
                Log = appended.Log,
                LogSeq = appended.LogSeq,
                Result = GameResult.Ongoing,
            };
        }

        public static BattleState Reduce(BattleState state, BattleAction action, IRng rng)
        {
            return action switch
            {
                PlayCardAction play => PlayCard(state, play.InstanceId),
                EndTurnAction => EndTurn(state, rng),
                RestartAction => InitState(rng),
                _ => state,
            };
        }
    }
}
