import { Piece } from '@chessire/pieces';

const PIECE_MAP = { k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: 'P' };

export default function ChessPiece({ type, color }) {
  const isPawn = type === 'p';
  const highlightGlow = isPawn
    ? color === 'b'
      ? ' drop-shadow(0 0 3px rgba(255,255,255,0.75))'
      : ' drop-shadow(0 0 3px rgba(0,0,0,0.75))'
    : '';

  return (
    <Piece
      piece={PIECE_MAP[type]}
      color={color === 'w' ? 'white' : 'black'}
      fillColor={color === 'w' ? '#f5f0e0' : '#2e2e2e'}
      strokeColor={color === 'w' ? '#1a1a1a' : '#c8c8c8'}
      width="82%"
      style={{ filter: `drop-shadow(1px 3px 3px rgba(0,0,0,0.4))${highlightGlow}` }}
    />
  );
}
