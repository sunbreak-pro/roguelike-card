using System;
using System.Collections.Generic;

namespace BattleCore
{
    /// <summary>
    /// Logic-layer driver for the pure battle core. This is the C# analogue of
    /// the React <c>useReducer</c> the Web version used: it holds the current
    /// <see cref="BattleState"/>, funnels every <see cref="BattleAction"/> through
    /// <see cref="BattleReducer.Reduce"/>, and notifies subscribers when the state
    /// actually changes.
    ///
    /// It is deliberately MonoBehaviour-free (pure C#) so it compiles and unit-tests
    /// headless via <c>dotnet test</c>. In a Unity project a thin View (UGUI
    /// MonoBehaviour implementing <see cref="IBattleView"/>) subscribes to this store
    /// and re-renders on each notification.
    /// </summary>
    public sealed class BattleStore
    {
        private readonly IRng _rng;
        private readonly List<Action<BattleState>> _subscribers = new List<Action<BattleState>>();

        /// <summary>The current battle state. Never null after construction.</summary>
        public BattleState State { get; private set; }

        /// <summary>
        /// Creates a store and runs <see cref="BattleReducer.InitState"/> immediately.
        /// Inject a <see cref="FixedRng"/> for deterministic (parity) runs or a
        /// <see cref="SystemRng"/> for real gameplay.
        /// </summary>
        public BattleStore(IRng rng)
        {
            _rng = rng ?? throw new ArgumentNullException(nameof(rng));
            State = BattleReducer.InitState(_rng);
        }

        /// <summary>
        /// Dispatches an action through the reducer. If the reducer returns the same
        /// state reference (a no-op, e.g. playing an unaffordable card or acting after
        /// the battle ended), subscribers are NOT notified.
        /// </summary>
        public void Dispatch(BattleAction action)
        {
            if (action == null) throw new ArgumentNullException(nameof(action));
            BattleState next = BattleReducer.Reduce(State, action, _rng);
            if (ReferenceEquals(next, State)) return; // reducer no-op
            State = next;
            NotifySubscribers();
        }

        // ---- Convenience dispatchers (mirror the View's three interactions) ----

        public void PlayCard(string instanceId) => Dispatch(new PlayCardAction(instanceId));

        public void EndTurn() => Dispatch(new EndTurnAction());

        public void Restart() => Dispatch(new RestartAction());

        /// <summary>
        /// Registers a listener and immediately emits the current state (React-style).
        /// Returns an unsubscribe delegate.
        /// </summary>
        public Action Subscribe(Action<BattleState> listener)
        {
            if (listener == null) throw new ArgumentNullException(nameof(listener));
            _subscribers.Add(listener);
            listener(State);
            return () => _subscribers.Remove(listener);
        }

        private void NotifySubscribers()
        {
            // Snapshot so a listener that unsubscribes during dispatch can't mutate
            // the collection mid-iteration.
            foreach (var listener in _subscribers.ToArray())
            {
                listener(State);
            }
        }

        // ---- Render helpers (delegate to the pure ViewModel) ----

        /// <summary>Flattened, render-ready snapshot of the current state.</summary>
        public BattleViewModel ToViewModel() => BattleViewModel.From(State);

        public IReadOnlyList<CardView> DescribeHand() => ViewModel.DescribeHand(State);

        public string DistanceLabel() => ViewModel.DistanceLabel(State.DistanceIndex);

        public bool IsBattleOver() => ViewModel.IsBattleOver(State.Result);
    }
}
