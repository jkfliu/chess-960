import { evaluate } from '../engine/ai.js';

const MAX_CP = 800; // centipawns at which the bar is fully one-sided

export default function EvalBar({ chess, theme, flipped }) {
  const isCheckmate = chess.isCheckmate();
  const isDraw      = chess.isDraw();
  const cp          = isCheckmate || isDraw ? null : evaluate(chess);

  const whitePct = isCheckmate
    ? (chess.turn() === 'w' ? 0 : 100)
    : isDraw ? 50
    : Math.round(50 + Math.max(-1, Math.min(1, cp / MAX_CP)) * 50);

  const label = isCheckmate ? 'M'
    : isDraw || cp === 0    ? '='
    : (cp > 0 ? '+' : '−') + Math.abs(cp / 100).toFixed(1);

  const blackPct  = 100 - whitePct;
  const topPct    = flipped ? whitePct : blackPct;
  const bottomPct = flipped ? blackPct : whitePct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 20, overflow: 'hidden' }}>
      <div
        style={{
          width: 14,
          flex: 1,
          border: `1px solid ${theme.border}`,
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ height: `${topPct}%`, backgroundColor: '#1a1a1a', transition: 'height 0.4s ease' }} />
        <div style={{ height: `${bottomPct}%`, backgroundColor: '#f0f0f0', transition: 'height 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 600, color: theme.text, opacity: 0.6, letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  );
}
