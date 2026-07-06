using System.Collections.Generic;

namespace BattleCore
{
    /// <summary>
    /// The contract a battle View implements. In Unity this is a UGUI
    /// MonoBehaviour that draws the screen; here it is kept UI-framework-agnostic
    /// and pure C# so the contract itself compiles headless and can be exercised
    /// with a fake view in <c>dotnet test</c>.
    ///
    /// Wiring in Unity (Phase 3):
    /// <code>
    /// var store = new BattleStore(new SystemRng());
    /// store.Subscribe(state => view.Render(BattleViewModel.From(state)));
    /// </code>
    /// </summary>
    public interface IBattleView
    {
        /// <summary>Called on every state change with a render-ready snapshot.</summary>
        void Render(BattleViewModel vm);
    }

    /// <summary>
    /// A flattened, render-ready projection of <see cref="BattleState"/>. It pulls
    /// every display value through the pure <see cref="ViewModel"/> helpers so the
    /// View never has to touch <see cref="Combat"/>/<see cref="Constants"/> directly.
    /// Building this is cheap and allocation-light; construct a fresh one per render.
    /// </summary>
    public sealed record BattleViewModel(
        int Turn,
        int PlayerHp,
        int PlayerStamina,
        int PlayerGuard,
        int EnemyHp,
        int EnemyStamina,
        string DistanceLabel,
        IReadOnlyList<CardView> Hand,
        IReadOnlyList<LogEntry> Log,
        GameResult Result,
        bool BattleOver,
        string EnemyRangeHint)
    {
        public static BattleViewModel From(BattleState state) => new BattleViewModel(
            Turn: state.Turn,
            PlayerHp: state.PlayerHp,
            PlayerStamina: state.PlayerStamina,
            PlayerGuard: state.PlayerGuard,
            EnemyHp: state.EnemyHp,
            EnemyStamina: state.EnemyStamina,
            DistanceLabel: ViewModel.DistanceLabel(state.DistanceIndex),
            Hand: ViewModel.DescribeHand(state),
            Log: state.Log,
            Result: state.Result,
            BattleOver: ViewModel.IsBattleOver(state.Result),
            EnemyRangeHint: ViewModel.EnemyRangeHint());
    }
}
