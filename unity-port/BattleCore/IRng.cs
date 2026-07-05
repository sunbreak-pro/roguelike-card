using System;

namespace BattleCore
{
    /// <summary>
    /// Random source abstraction. The TS core calls the global Math.random()
    /// directly; the C# port injects this instead so parity fixtures can pin
    /// the RNG to a fixed value. NextDouble() returns [0, 1) like Math.random().
    /// </summary>
    public interface IRng
    {
        double NextDouble();
    }

    /// <summary>System.Random-backed RNG for real gameplay.</summary>
    public sealed class SystemRng : IRng
    {
        private readonly Random _random;

        public SystemRng() : this(new Random()) { }

        public SystemRng(int seed) : this(new Random(seed)) { }

        public SystemRng(Random random)
        {
            _random = random ?? throw new ArgumentNullException(nameof(random));
        }

        public double NextDouble() => _random.NextDouble();
    }

    /// <summary>
    /// Deterministic RNG that always returns a fixed value (default 0).
    /// Mirrors the parity fixture generation where Math.random() was pinned to 0.
    /// </summary>
    public sealed class FixedRng : IRng
    {
        private readonly double _value;

        public FixedRng(double value = 0.0)
        {
            _value = value;
        }

        public double NextDouble() => _value;
    }
}
