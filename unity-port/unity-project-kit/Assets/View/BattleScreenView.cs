// Phase 3 starting point — the UGUI battle screen.
//
// This file references UnityEngine and ONLY compiles inside a Unity project.
// It is deliberately kept OUT of the headless dotnet library (unity-port/
// BattleCore*), which stays engine-free so `dotnet test` can run it. The
// #if guard means it is inert anywhere that is not Unity.
//
// It shows the whole wiring in one place: construct the store, subscribe the
// view, and route the three player interactions back into the store. The
// Render body is a stub — fill it in with real UGUI in Phase 3.

#if UNITY_2021_2_OR_NEWER
using System;
using UnityEngine;
using BattleCore;

public sealed class BattleScreenView : MonoBehaviour, IBattleView
{
    private BattleStore _store;
    private Action _unsubscribe;

    private void Start()
    {
        // SystemRng for real play; swap for `new FixedRng(0)` to mirror the
        // parity trace while debugging.
        _store = new BattleStore(new SystemRng());
        _unsubscribe = _store.Subscribe(state => Render(BattleViewModel.From(state)));
    }

    private void OnDestroy() => _unsubscribe?.Invoke();

    public void Render(BattleViewModel vm)
    {
        // TODO (Phase 3): draw the HP / stamina / guard panels for both sides,
        // the distance as real on-screen spacing + posture sprites (the
        // 2026-07-04 decision — not a tab/track), the hand (vm.Hand -> clickable
        // cards that call OnCardClicked), the log (vm.Log, newest first), and the
        // result overlay when vm.BattleOver. For now just prove the loop runs.
        Debug.Log(
            $"[Battle] turn {vm.Turn}  " +
            $"P {vm.PlayerHp}hp/{vm.PlayerStamina}st/{vm.PlayerGuard}gd  " +
            $"E {vm.EnemyHp}hp/{vm.EnemyStamina}st  " +
            $"dist={vm.DistanceLabel}  hand={vm.Hand.Count}  result={vm.Result}");
    }

    // Wire these to UGUI Buttons in the Inspector (Phase 3).
    public void OnCardClicked(string instanceId) => _store.PlayCard(instanceId);
    public void OnEndTurnClicked() => _store.EndTurn();
    public void OnRestartClicked() => _store.Restart();
}
#endif
