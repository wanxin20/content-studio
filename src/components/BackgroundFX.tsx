/**
 * Background visual effects for the dark tech aesthetic.
 *
 * Layers (bottom → top, all pointer-events: none):
 *   1. Engineering grid (drifts horizontally over 60s) — already in parent
 *   2. Static circuit-trace pattern (subtle, faint)
 *   3. Flowing dash highlights on a few key paths (animated)
 *   4. Radial color blobs (cyan / magenta / amber halos)
 *   5. Drifting particles (subtle pulses at random positions)
 *   6. One scan line drifting top → bottom
 */
export default function BackgroundFX({ palette = 'home' }: { palette?: 'home' | 'magenta' | 'acid' }) {
  const blob1 = '#00E5FF';
  const blob2 = palette === 'magenta' ? '#FF2D55' : palette === 'acid' ? '#9FFF1F' : '#FF2D55';
  const blob3 = '#FFB800';

  return (
    <>
      {/* Static circuit-trace tile (faint) */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id="circuit-tile" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
            {/* horizontal + vertical traces */}
            <path d="M0 40 L 80 40 L 80 130 L 200 130" stroke="#2D3A56" strokeWidth="1" fill="none" opacity="0.65" />
            <path d="M40 0 L 40 80 L 130 80 L 130 200" stroke="#2D3A56" strokeWidth="1" fill="none" opacity="0.65" />
            <path d="M200 0 L 200 60 L 130 60" stroke="#2D3A56" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M0 180 L 60 180 L 60 240" stroke="#2D3A56" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M170 240 L 170 170 L 240 170" stroke="#2D3A56" strokeWidth="1" fill="none" opacity="0.4" />
            {/* 45deg accents */}
            <path d="M100 100 L 130 130" stroke="#2D3A56" strokeWidth="1" fill="none" opacity="0.35" />
            {/* nodes */}
            <circle cx="80" cy="40" r="2" fill="#3D4E78" />
            <circle cx="80" cy="130" r="2" fill="#3D4E78" />
            <circle cx="200" cy="130" r="2" fill="#3D4E78" />
            <circle cx="40" cy="80" r="2" fill="#3D4E78" />
            <circle cx="130" cy="80" r="2" fill="#3D4E78" />
            <circle cx="130" cy="200" r="2" fill="#3D4E78" />
            <circle cx="200" cy="60" r="2" fill="#3D4E78" />
            <circle cx="130" cy="60" r="1.5" fill="#3D4E78" />
            <circle cx="60" cy="180" r="2" fill="#3D4E78" />
            <circle cx="170" cy="170" r="2" fill="#3D4E78" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-tile)" opacity="0.6" />
      </svg>

      {/* Flowing highlight paths (energy traveling along select segments) */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <defs>
          <linearGradient id="cyan-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mag-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF2D55" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF2D55" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF2D55" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="amber-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFB800" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Three traveling pulses at different speeds & positions */}
        <line x1="-10" y1="18" x2="20" y2="18" stroke="url(#cyan-flow)" strokeWidth="0.18" vectorEffect="non-scaling-stroke">
          <animate attributeName="x1" from="-10" to="110" dur="9s" repeatCount="indefinite" />
          <animate attributeName="x2" from="20" to="140" dur="9s" repeatCount="indefinite" />
        </line>
        <line x1="-10" y1="72" x2="22" y2="72" stroke="url(#mag-flow)" strokeWidth="0.18" vectorEffect="non-scaling-stroke">
          <animate attributeName="x1" from="-10" to="110" dur="13s" repeatCount="indefinite" begin="2s" />
          <animate attributeName="x2" from="22" to="142" dur="13s" repeatCount="indefinite" begin="2s" />
        </line>
        <line x1="-10" y1="45" x2="16" y2="45" stroke="url(#amber-flow)" strokeWidth="0.14" vectorEffect="non-scaling-stroke">
          <animate attributeName="x1" from="-10" to="110" dur="16s" repeatCount="indefinite" begin="5s" />
          <animate attributeName="x2" from="16" to="136" dur="16s" repeatCount="indefinite" begin="5s" />
        </line>
      </svg>

      {/* Radial color halos (warm + cool) */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div
          className="absolute -top-40 -left-32 w-[40rem] h-[40rem] rounded-full"
          style={{ background: `radial-gradient(circle, ${blob1}14, transparent 60%)`, filter: 'blur(48px)' }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[44rem] h-[44rem] rounded-full"
          style={{ background: `radial-gradient(circle, ${blob2}10, transparent 60%)`, filter: 'blur(56px)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[36rem] h-[36rem] rounded-full"
          style={{
            background: `radial-gradient(circle, ${blob3}0E, transparent 60%)`,
            filter: 'blur(64px)',
            transform: 'translateY(40%)',
          }}
        />
      </div>

      {/* Drifting particles (8 dots with pulsing opacity + slow vertical drift) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <Particle x="12%" y="20%" color="#00E5FF" delay={0} dur={4} />
        <Particle x="78%" y="15%" color="#FFB800" delay={1.3} dur={5} />
        <Particle x="62%" y="38%" color="#00E5FF" delay={2.6} dur={4.5} />
        <Particle x="22%" y="55%" color="#FF2D55" delay={0.8} dur={5.5} />
        <Particle x="88%" y="62%" color="#00E5FF" delay={3.4} dur={4.2} />
        <Particle x="40%" y="78%" color="#9FFF1F" delay={1.9} dur={5} />
        <Particle x="14%" y="86%" color="#FFB800" delay={4.1} dur={6} />
        <Particle x="70%" y="88%" color="#FF2D55" delay={2.2} dur={5.3} />
      </div>

      {/* Single drifting scan line */}
      <div className="scan-line" aria-hidden />
    </>
  );
}

function Particle({
  x, y, color, delay, dur,
}: { x: string; y: string; color: string; delay: number; dur: number }) {
  return (
    <span
      className="absolute block w-[3px] h-[3px] rounded-full"
      style={{
        left: x,
        top: y,
        background: color,
        boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80`,
        animation: `particlePulse ${dur}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}
