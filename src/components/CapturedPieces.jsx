import { Piece } from '@chessire/pieces';
import { PIECE_VALUES } from '../constants.js';

const PIECE_MAP = { k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: 'P' };
const PIECES_PER_ROW = 8;

function materialScore(pieces) {
  return pieces.reduce((sum, p) => sum + (PIECE_VALUES[p.type] ?? 0), 0);
}

function PieceRow({ pieces }) {
  const sorted = [...pieces].sort((a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]);
  const rows = [];
  for (let i = 0; i < sorted.length; i += PIECES_PER_ROW) rows.push(sorted.slice(i, i + PIECES_PER_ROW));
  return (
    <div className="flex flex-col gap-0.5">
      {rows.map((row, r) => (
        <div key={r} className="flex gap-0.5 items-center min-h-6">
          {row.map((p, i) => (
            <Piece
              key={i}
              piece={PIECE_MAP[p.type]}
              color={p.color === 'w' ? 'white' : 'black'}
              fillColor={p.color === 'w' ? '#f5f0e0' : '#2e2e2e'}
              strokeColor={p.color === 'w' ? '#1a1a1a' : '#c8c8c8'}
              width={20}
              style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.4))' }}
            />
          ))}
        </div>
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
