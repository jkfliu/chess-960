import { PIECE_VALUES } from '../constants.js';

// Piece-square tables (from white's perspective, rank 0 = rank 1)
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10,-20,-20, 10, 10,  5,
     5, -5,-10,  0,  0,-10, -5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5,  5, 10, 25, 25, 10,  5,  5,
    10, 10, 20, 30, 30, 20, 10, 10,
    50, 50, 50, 50, 50, 50, 50, 50,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  5,  5,  0,  0,  0,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     5, 10, 10, 10, 10, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -10,  5,  5,  5,  5,  5,  0,-10,
      0,  0,  5,  5,  5,  5,  0, -5,
     -5,  0,  5,  5,  5,  5,  0, -5,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
     20, 30, 10,  0,  0, 10, 30, 20,
     20, 20,  0,  0,  0,  0, 20, 20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
  ],
};


export function evaluate(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -10000 : 10000;
  if (chess.isDraw()) return 0;

  let score = 0;
  const board = chess.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const value = PIECE_VALUES[piece.type] * 100;
      // PST: white indexes from rank 7 down, black mirrors
      const pstIndex = piece.color === 'w'
        ? (7 - rank) * 8 + file
        : rank * 8 + file;
      const pstBonus = PST[piece.type]?.[pstIndex] ?? 0;

      if (piece.color === 'w') {
        score += value + pstBonus;
      } else {
        score -= value + pstBonus;
      }
    }
  }

  return score;
}

// Captures (+2) and checks/mates (+1) are searched first to maximise pruning.
function moveScore(m) {
  return (m.captured ? 2 : 0) + (m.san.endsWith('+') || m.san.endsWith('#') ? 1 : 0);
}

function orderedMoves(chess) {
  return chess.moves({ verbose: true }).sort((a, b) => moveScore(b) - moveScore(a));
}

function alphaBeta(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || chess.isGameOver()) return evaluate(chess);

  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of orderedMoves(chess)) {
    chess.move(move);
    const score = alphaBeta(chess, depth - 1, alpha, beta, !isMaximizing);
    chess.undo();

    if (isMaximizing) {
      if (score > bestScore) bestScore = score;
      if (score > alpha) alpha = score;
    } else {
      if (score < bestScore) bestScore = score;
      if (score < beta) beta = score;
    }
    if (beta <= alpha) break;
  }

  return bestScore;
}

export const DIFFICULTY = {
  easy:   { depth: 1, noise: 200, moveDelay: 300 },
  medium: { depth: 3, noise: 50,  moveDelay: 500 },
  hard:   { depth: 5, noise: 0,   moveDelay: 1000 },
};

export function getBestMove(chess, difficulty = 'medium') {
  const { depth, noise } = DIFFICULTY[difficulty];
  const moves = orderedMoves(chess);
  if (moves.length === 0) return null;

  const isMaximizing = chess.turn() === 'w';
  let bestMove = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move(move);
    let score = alphaBeta(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    // Add noise for lower difficulties
    if (noise > 0) score += (Math.random() - 0.5) * noise;

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove.san;
}
