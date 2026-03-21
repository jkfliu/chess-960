// SVG chess pieces on a 45×45 viewBox.
// Radial gradients + drop shadow give a 3D appearance.

export default function ChessPiece({ type, color }) {
  const gradId   = `chess-fill-${color}`;
  const shadowId = 'chess-shadow';
  const stroke   = color === 'w' ? '#444' : '#999';
  const dot      = stroke;

  const g = {
    fill: `url(#${gradId})`,
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    filter: `url(#${shadowId})`,
  };

  const shapes = {
    // ── Pawn ────────────────────────────────────────────────────────────────
    p: <>
      <circle cx="22.5" cy="11" r="5" />
      <path d="M19.5 15.5 L16 30 L29 30 L25.5 15.5 Z" />
      <rect x="11" y="30" width="23" height="5" rx="2.5" />
    </>,

    // ── Rook ────────────────────────────────────────────────────────────────
    r: <>
      <rect x="12"  y="8"  width="5" height="7" />
      <rect x="20"  y="8"  width="5" height="7" />
      <rect x="28"  y="8"  width="5" height="7" />
      <rect x="14"  y="15" width="17" height="17" />
      <rect x="11"  y="32" width="23" height="5" rx="2.5" />
    </>,

    // ── Knight ──────────────────────────────────────────────────────────────
    n: <>
      <path d="M15 37 L15 26 C15 20 19 15 24 12 L30 10 L29 15 C32 16 33 20 33 23 L29 23 C28 27 27 31 27 37 Z" />
      <rect x="11" y="32" width="23" height="5" rx="2.5" />
      <circle cx="25" cy="15" r="1.5" fill={dot} stroke="none" />
    </>,

    // ── Bishop ──────────────────────────────────────────────────────────────
    b: <>
      <circle cx="22.5" cy="9.5" r="4.5" />
      <path d="M22.5 13.5 L15 33 L30 33 Z" />
      <circle cx="22.5" cy="9.5" r="1.5" fill={dot} stroke="none" />
      <rect x="11" y="33" width="23" height="5" rx="2.5" />
    </>,

    // ── Queen ───────────────────────────────────────────────────────────────
    q: <>
      <circle cx="9"    cy="12"   r="3" />
      <circle cx="22.5" cy="8"    r="3" />
      <circle cx="36"   cy="12"   r="3" />
      <circle cx="15"   cy="13.5" r="2.5" />
      <circle cx="30"   cy="13.5" r="2.5" />
      <path d="M9 14 L14 33 L31 33 L36 14 L30 16.5 L22.5 11 L15 16.5 Z" />
      <rect x="11" y="33" width="23" height="5" rx="2.5" />
    </>,

    // ── King ────────────────────────────────────────────────────────────────
    k: <>
      <rect x="20.5" y="3.5" width="4"  height="11" />
      <rect x="16.5" y="7"   width="12" height="4"  />
      <path d="M14 33 L16 17 L29 17 L31 33 Z" />
      <rect x="11" y="33" width="23" height="5" rx="2.5" />
    </>,
  };

  return (
    <svg
      viewBox="0 0 45 45"
      style={{ width: '82%', height: '82%', display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {color === 'w'
          ? <radialGradient id={gradId} cx="35%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
              <stop offset="0%"   stopColor="#ffffff" />
              <stop offset="100%" stopColor="#b8b8a8" />
            </radialGradient>
          : <radialGradient id={gradId} cx="35%" cy="28%" r="65%" gradientUnits="objectBoundingBox">
              <stop offset="0%"   stopColor="#707070" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </radialGradient>
        }
        <filter id={shadowId} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>
      <g {...g}>{shapes[type]}</g>
    </svg>
  );
}
