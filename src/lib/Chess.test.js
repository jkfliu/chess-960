import { describe, it, expect } from 'vitest';
import { Chess } from './Chess.js';

// ── board() ────────────────────────────────────────────────────────────────────

describe('Chess#board', () => {
  it('returns an 8×8 grid', () => {
    const chess = new Chess();
    const board = chess.board();
    expect(board).toHaveLength(8);
    board.forEach(row => expect(row).toHaveLength(8));
  });

  it('places white pieces on rows 6 and 7 (ranks 1 and 2)', () => {
    const chess = new Chess();
    const board = chess.board();
    // Row 7 = rank 1 (white back rank)
    expect(board[7][0]).toEqual({ type: 'r', color: 'w' }); // Ra1
    expect(board[7][4]).toEqual({ type: 'k', color: 'w' }); // Ke1
    // Row 6 = rank 2 (white pawns)
    expect(board[6][0]).toEqual({ type: 'p', color: 'w' }); // Pa2
  });

  it('places black pieces on rows 0 and 1 (ranks 8 and 7)', () => {
    const chess = new Chess();
    const board = chess.board();
    expect(board[0][0]).toEqual({ type: 'r', color: 'b' }); // Ra8
    expect(board[1][3]).toEqual({ type: 'p', color: 'b' }); // Pd7
  });

  it('has null for empty squares', () => {
    const chess = new Chess();
    const board = chess.board();
    expect(board[4][4]).toBeNull();
  });
});

// ── get() ──────────────────────────────────────────────────────────────────────

describe('Chess#get', () => {
  it('returns the piece on a populated square', () => {
    const chess = new Chess();
    expect(chess.get('e1')).toEqual({ type: 'k', color: 'w' });
  });

  it('returns null for an empty square', () => {
    const chess = new Chess();
    expect(chess.get('e4')).toBeNull();
  });
});

// ── moves() non-verbose ────────────────────────────────────────────────────────

describe('Chess#moves (non-verbose)', () => {
  it('returns SAN strings by default', () => {
    const chess = new Chess();
    const moves = chess.moves();
    expect(Array.isArray(moves)).toBe(true);
    expect(typeof moves[0]).toBe('string');
    expect(moves).toContain('e4');
  });
});

// ── isPromotion() ──────────────────────────────────────────────────────────────

describe('Chess#isPromotion', () => {
  it('returns true for a white pawn reaching rank 8', () => {
    const chess = new Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    expect(chess.isPromotion('a7', 'a8')).toBe(true);
  });

  it('returns true for a black pawn reaching rank 1', () => {
    const chess = new Chess('4k3/8/8/8/8/8/p7/4K3 b - - 0 1');
    expect(chess.isPromotion('a2', 'a1')).toBe(true);
  });

  it('returns false for a non-pawn piece', () => {
    const chess = new Chess();
    expect(chess.isPromotion('e1', 'e2')).toBe(false);
  });

  it('returns false for a pawn not on the back rank', () => {
    const chess = new Chess();
    expect(chess.isPromotion('e2', 'e4')).toBe(false);
  });
});

// ── isInsufficientMaterial / isDraw / isGameOver ───────────────────────────────

describe('Chess draw detection', () => {
  it('undo on empty stack returns null', () => {
    const chess = new Chess();
    expect(chess.undo()).toBeNull();
  });

  it('isCheck returns true when king is in check', () => {
    const chess = new Chess('4k3/8/8/8/8/8/8/4KR2 w - - 0 1');
    chess.move('Rf8+');
    expect(chess.isCheck()).toBe(true);
  });

  it('isInsufficientMaterial returns true for K vs K', () => {
    const chess = new Chess('k7/8/8/8/8/8/8/7K w - - 0 1');
    expect(chess.isInsufficientMaterial()).toBe(true);
  });

  it('isInsufficientMaterial returns false when material remains', () => {
    const chess = new Chess('k7/8/8/8/8/8/8/KQ6 w - - 0 1');
    expect(chess.isInsufficientMaterial()).toBe(false);
  });

  it('isDraw returns true for insufficient material', () => {
    const chess = new Chess('k7/8/8/8/8/8/8/7K w - - 0 1');
    expect(chess.isDraw()).toBe(true);
  });

  it('isDraw returns true when halfmoves reaches 100', () => {
    const chess = new Chess('k7/8/8/8/8/8/8/KQ6 w - - 100 1');
    expect(chess.isDraw()).toBe(true);
  });

  it('isDraw returns false in a normal position', () => {
    const chess = new Chess();
    expect(chess.isDraw()).toBe(false);
  });

  it('isGameOver returns true after checkmate', () => {
    const chess = new Chess('R5k1/5ppp/8/8/8/8/8/6K1 b - - 0 1');
    expect(chess.isGameOver()).toBe(true);
  });

  it('isGameOver returns false in a normal position', () => {
    const chess = new Chess();
    expect(chess.isGameOver()).toBe(false);
  });
});

// ── isThreefoldRepetition ──────────────────────────────────────────────────────

describe('Chess#isThreefoldRepetition', () => {
  it('returns false before three repetitions', () => {
    const chess = new Chess();
    chess.move('Nf3'); chess.move('Nf6');
    chess.move('Ng1'); chess.move('Ng8');
    expect(chess.isThreefoldRepetition()).toBe(false);
  });

  it('returns true after the position repeats three times', () => {
    const chess = new Chess();
    // Starting position is count 1; repeat twice more = 3 total
    chess.move('Nf3'); chess.move('Nf6');
    chess.move('Ng1'); chess.move('Ng8'); // back to start = count 2
    chess.move('Nf3'); chess.move('Nf6');
    chess.move('Ng1'); chess.move('Ng8'); // back to start = count 3
    expect(chess.isThreefoldRepetition()).toBe(true);
  });
});

// ── history() verbose ──────────────────────────────────────────────────────────

describe('Chess#history', () => {
  it('returns SAN strings by default', () => {
    const chess = new Chess();
    chess.move('e4');
    expect(chess.history()).toEqual(['e4']);
  });

  it('returns null for an illegal object move', () => {
    const chess = new Chess();
    expect(chess.move({ from: 'e2', to: 'e5' })).toBeNull(); // illegal jump
  });

  it('records en passant capture', () => {
    // Set up en passant: white e5, black plays d5, white captures exd6
    const chess = new Chess('4k3/8/8/4Pp2/8/8/8/4K3 w - f6 0 1');
    const result = chess.move({ from: 'e5', to: 'f6' });
    expect(result).not.toBeNull();
    expect(result.captured).toBe('p');
    expect(result.san).toBe('exf6');
  });

  it('non-promotion pawn move ignores spurious promotion field', () => {
    const chess = new Chess();
    const result = chess.move({ from: 'e2', to: 'e4', promotion: 'q' });
    expect(result).not.toBeNull();
    expect(result.san).toBe('e4');       // no =Q suffix
    expect(result.promotion).toBeUndefined();
    expect(chess.get('e4')).toEqual({ type: 'p', color: 'w' }); // still a pawn
  });

  it('records promotion piece in verbose move', () => {
    const chess = new Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    const result = chess.move({ from: 'a7', to: 'a8', promotion: 'q' });
    expect(result.promotion).toBe('q');
    expect(result.san).toBe('a8=Q+');
  });

  it('returns verbose move objects with captured field', () => {
    // Fool's mate setup — white pawn captures
    const chess = new Chess('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
    chess.move('exd5');
    const hist = chess.history({ verbose: true });
    expect(hist[0].captured).toBe('p');
    expect(hist[0].color).toBe('w');
    expect(hist[0].from).toBe('e4');
    expect(hist[0].to).toBe('d5');
  });
});

// ── Chess960 castling ──────────────────────────────────────────────────────────

describe('Chess960 castling', () => {
  it('king can castle to rook squares in a Chess960 position', () => {
    // King on d1, rooks on a1 and g1, path clear
    const chess = new Chess('4k3/8/8/8/8/8/8/R2K2R1 w KQkq - 0 1');
    const kingMoves = chess.moves({ square: 'd1', verbose: true }).map(m => m.to);
    expect(kingMoves).toContain('a1'); // queenside castle
    expect(kingMoves).toContain('g1'); // kingside castle
  });

  it('queenside castle moves king to c1 and returns correct squares', () => {
    const chess = new Chess('4k3/8/8/8/8/8/8/R2K2R1 w KQkq - 0 1');
    const result = chess.move({ from: 'd1', to: 'a1' });
    expect(result.san).toBe('O-O-O');
    expect(result.from).toBe('d1');
    expect(result.to).toBe('c1'); // king's actual landing square
    expect(chess.fen()).toContain('2KR2R1');
  });

  it('undo restores position after castling', () => {
    const chess = new Chess('4k3/8/8/8/8/8/8/R2K2R1 w KQkq - 0 1');
    const fenBefore = chess.fen(); // chessops normalises castling rights (strips kq: no black rooks)
    chess.move({ from: 'd1', to: 'a1' });
    chess.undo();
    expect(chess.fen()).toBe(fenBefore);
  });
});
