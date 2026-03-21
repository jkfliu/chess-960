// Knight placement lookup: 10 combinations for 2 knights in 5 remaining squares
const KNIGHT_TABLE = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 2], [1, 3], [1, 4],
  [2, 3], [2, 4],
  [3, 4],
];

/**
 * Generate the Chess960 back rank for a given position ID (0–959).
 * Returns an array of 8 piece chars: k, q, r, b, n
 */
export function generateChess960Rank(id) {
  const rank = new Array(8).fill(null);
  let n = id;

  // Step 1: bishop on b/d/f/h (odd files: 1,3,5,7)
  rank[(n % 4) * 2 + 1] = 'b';
  n = Math.floor(n / 4);

  // Step 2: bishop on a/c/e/g (even files: 0,2,4,6)
  rank[(n % 4) * 2] = 'b';
  n = Math.floor(n / 4);

  // Step 3: queen on nth empty square (0–5)
  let empty = 0;
  const qTarget = n % 6;
  n = Math.floor(n / 6);
  for (let i = 0; i < 8; i++) {
    if (!rank[i]) {
      if (empty === qTarget) { rank[i] = 'q'; break; }
      empty++;
    }
  }

  // Step 4: two knights from the 10-combination table
  const [na, nb] = KNIGHT_TABLE[n];
  empty = 0;
  for (let i = 0; i < 8; i++) {
    if (!rank[i]) {
      if (empty === na || empty === nb) rank[i] = 'n';
      empty++;
    }
  }

  // Step 5: remaining 3 squares → rook, king, rook
  const rem = rank.reduce((acc, p, i) => (!p ? [...acc, i] : acc), []);
  rank[rem[0]] = 'r';
  rank[rem[1]] = 'k';
  rank[rem[2]] = 'r';

  return rank;
}

/**
 * Build a FEN string for the given Chess960 position ID.
 * Castling rights are only given for SP 518 (standard chess starting position)
 * because chess.js v1.x hardcodes rooks on a1/h1 for castling logic.
 */
export function positionToFen(id) {
  const rank = generateChess960Rank(id);
  const blackRank = rank.join('');
  const whiteRank = rank.map(p => p.toUpperCase()).join('');
  const castling = blackRank === 'rnbqkbnr' ? 'KQkq' : '-';
  return `${blackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRank} w ${castling} - 0 1`;
}
