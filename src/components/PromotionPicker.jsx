import ChessPiece from './ChessPiece.jsx';
import { FILES } from '../constants.js';

const PROMOTION_PIECES = ['q', 'r', 'b', 'n'];

const BUTTON_STYLE_BASE = {
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  width: '100%',
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function PromotionPicker({ color, toSquare, flipped, onChoice, theme }) {
  if (!toSquare) return null;

  const file = toSquare[0];
  const rank = parseInt(toSquare[1], 10);
  const fileIndex = flipped ? 7 - FILES.indexOf(file) : FILES.indexOf(file);
  const leftPercent = fileIndex * 12.5;

  // When flipped the visual top/bottom is inverted, so white's pieces go down only when unflipped
  const pieceGoesDown = (color === 'w') === !flipped;

  const rankRow = flipped ? rank - 1 : 8 - rank;
  const topPercent = rankRow * 12.5;

  const containerStyle = {
    position: 'absolute',
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    width: '12.5%',
    zIndex: 20,
    display: 'flex',
    flexDirection: pieceGoesDown ? 'column' : 'column-reverse',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    border: `2px solid ${theme.border}`,
    borderRadius: 4,
    overflow: 'hidden',
  };

  return (
    <>
      {/* Backdrop to block interaction with rest of board */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.35)',
          cursor: 'default',
        }}
        data-testid="promotion-backdrop"
      />

      <div style={containerStyle} data-testid="promotion-picker">
        {PROMOTION_PIECES.map((piece) => (
          <button
            key={piece}
            data-testid={`promote-${piece}`}
            onClick={() => onChoice(piece)}
            style={{ ...BUTTON_STYLE_BASE, background: theme.panelBg }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.highlight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.panelBg;
            }}
            title={`Promote to ${piece.toUpperCase()}`}
          >
            <ChessPiece type={piece} color={color} />
          </button>
        ))}
      </div>
    </>
  );
}
