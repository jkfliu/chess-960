import { PIECE_VALUES, PIECE_GLYPHS } from '../constants.js';

function materialScore(pieces) {
  return pieces.reduce((sum, p) => sum + (PIECE_VALUES[p.type] ?? 0), 0);
}

function PieceRow({ pieces }) {
  const sorted = [...pieces].sort((a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]);
  return (
    <div className="flex flex-wrap gap-0.5 min-h-6">
      {sorted.map((p, i) => (
        <span key={i} style={{ fontSize: 18, lineHeight: 1 }}>
          {PIECE_GLYPHS[p.color][p.type]}
        </span>
      ))}
    </div>
  );
}

export default function CapturedPieces({ capturedPieces, theme }) {
  // capturedPieces.w = pieces white has captured (black pieces taken)
  // capturedPieces.b = pieces black has captured (white pieces taken)
  const whiteAdvantage = materialScore(capturedPieces.w) - materialScore(capturedPieces.b);

  return (
    <div style={{ color: theme.text }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">
        Captured Pieces
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <PieceRow pieces={capturedPieces.w} />
          {whiteAdvantage > 0 && <span className="text-xs font-bold">+{whiteAdvantage}</span>}
        </div>
        <div className="flex items-center gap-2">
          <PieceRow pieces={capturedPieces.b} />
          {whiteAdvantage < 0 && <span className="text-xs font-bold">+{Math.abs(whiteAdvantage)}</span>}
        </div>
      </div>
    </div>
  );
}
