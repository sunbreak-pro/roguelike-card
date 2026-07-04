using System;
using System.Collections.Generic;

namespace BattleCore
{
    public sealed record DrawResult(
        IReadOnlyList<PrototypeCard> Hand,
        IReadOnlyList<PrototypeCard> DrawPile,
        IReadOnlyList<PrototypeCard> DiscardPile);

    public static class Cards
    {
        /// <summary>
        /// Card definitions (without instanceId). Mirrors CARD_DEFS order in cards.ts;
        /// deck build order depends on it, so the sequence must not change.
        /// </summary>
        public static readonly IReadOnlyList<PrototypeCard> CardDefs = new[]
        {
            new PrototypeCard("", CardDefId.Thrust, "突き", CardType.Attack, 4, RangeBand.Close, 9, 0, 0, "近接最大火力。"),
            new PrototypeCard("", CardDefId.Lunge, "踏み込み斬り", CardType.Attack, 5, RangeBand.Close, 7, -1, 0, "攻撃しつつ間合いを詰める。"),
            new PrototypeCard("", CardDefId.Feint, "牽制", CardType.Attack, 3, RangeBand.Mid, 4, 1, 0, "削りつつ後退する。"),
            new PrototypeCard("", CardDefId.StepIn, "足捌き・前", CardType.Move, 2, null, 0, -1, 0, "間合いを詰める。"),
            new PrototypeCard("", CardDefId.StepOut, "足捌き・後", CardType.Move, 1, null, 0, 1, 0, "間合いを離す。安い。"),
            new PrototypeCard("", CardDefId.Brace, "呼吸を整える", CardType.Guard, 2, null, 0, 0, 6, "受けを固める。次の被弾を軽減。"),
        };

        private const int DeckCopies = 2;

        public static List<PrototypeCard> CreateInitialDeck()
        {
            var deck = new List<PrototypeCard>();
            foreach (var def in CardDefs)
            {
                for (int copy = 0; copy < DeckCopies; copy++)
                {
                    deck.Add(def with { InstanceId = $"{def.DefId.ToToken()}-{copy}" });
                }
            }
            return deck;
        }

        public static List<T> Shuffle<T>(IReadOnlyList<T> input, IRng rng)
        {
            var arr = new List<T>(input);
            for (int i = arr.Count - 1; i > 0; i--)
            {
                int j = (int)Math.Floor(rng.NextDouble() * (i + 1));
                (arr[i], arr[j]) = (arr[j], arr[i]);
            }
            return arr;
        }

        public static DrawResult DrawToHandSize(
            IReadOnlyList<PrototypeCard> drawPile,
            IReadOnlyList<PrototypeCard> discardPile,
            IReadOnlyList<PrototypeCard> hand,
            int target,
            IRng rng)
        {
            var draw = new List<PrototypeCard>(drawPile);
            var discard = new List<PrototypeCard>(discardPile);
            var newHand = new List<PrototypeCard>(hand);
            while (newHand.Count < target)
            {
                if (draw.Count == 0)
                {
                    if (discard.Count == 0) break;
                    draw = Shuffle(discard, rng);
                    discard = new List<PrototypeCard>();
                }
                var next = draw[0];
                draw.RemoveAt(0);
                newHand.Add(next);
            }
            return new DrawResult(newHand, draw, discard);
        }
    }
}
