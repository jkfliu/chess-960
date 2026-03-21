import ChessPiece from './ChessPiece.jsx';

export default function Square({ piece, isLight, isSelected, isHighlight, isLastMove, onClick, theme }) {
  const bg = isSelected
    ? theme.highlight
    : isHighlight
    ? theme.highlight
    : isLastMove
    ? theme.lastMove
    : isLight
    ? theme.lightSquare
    : theme.darkSquare;

  return (
    <div
      onClick={onClick}
      style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.15) 100%), ${bg}` }}
      className="w-full aspect-square flex items-center justify-center cursor-pointer select-none relative"
    >
      {piece && <ChessPiece type={piece.type} color={piece.color} />}
    </div>
  );
}
