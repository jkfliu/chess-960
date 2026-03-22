import Square from './Square';
import { FILES, RANKS } from '../constants.js';

export default function Board({ chess, selectedSquare, legalMoves, lastMove, onSquareClick, theme, flipped }) {
  const board = chess.board();

  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  return (
    <div
      className="relative"
      style={{
        border: `2px solid ${theme.border}`,
        userSelect: 'none',
      }}
    >
      <div className="grid grid-cols-8">
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = `${file}${rank}`;
            const boardRank = 8 - rank; // 0-indexed from top
            const boardFile = FILES.indexOf(file);
            const piece = board[boardRank][boardFile];
            const isLight = (rankIdx + fileIdx) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isHighlight = legalMoves.includes(square);
            const isLastMove = lastMove
              ? lastMove.from === square || lastMove.to === square
              : false;

            return (
              <Square
                key={square}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isHighlight={isHighlight}
                isLastMove={isLastMove}
                onClick={() => onSquareClick(square)}
                theme={theme}
              />
            );
          })
        )}
      </div>

      {/* Rank labels */}
      <div className="absolute top-0 left-0 h-full flex flex-col pointer-events-none">
        {ranks.map((rank) => (
          <div
            key={rank}
            className="flex-1 flex items-start justify-start pl-0.5 pt-0.5"
            style={{ fontSize: '10px', color: theme.border, fontWeight: 600 }}
          >
            {rank}
          </div>
        ))}
      </div>

      {/* File labels */}
      <div className="absolute bottom-0 left-0 w-full flex pointer-events-none">
        {files.map((file) => (
          <div
            key={file}
            className="flex-1 flex items-end justify-end pr-0.5 pb-0.5"
            style={{ fontSize: '10px', color: theme.border, fontWeight: 600 }}
          >
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}
