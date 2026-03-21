import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { getBestMove, evaluate } from './ai.js';

// ── evaluate ──────────────────────────────────────────────────────────────────

describe('evaluate', () => {
  it('returns 0 for insufficient material', () => {
    const chess = new Chess('k7/8/8/8/8/8/8/7K w - - 0 1');
    expect(evaluate(chess)).toBe(0);
  });

  it('returns 0 for stalemate', () => {
    // Black king on a8, white queen on b6 — all black king moves are attacked
    const chess = new Chess('k7/8/1Q6/8/8/8/8/6K1 b - - 0 1');
    expect(evaluate(chess)).toBe(0);
  });

  it('returns -10000 when white is checkmated', () => {
    // Fool's mate — white king trapped, Qh4# delivered
    const chess = new Chess('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    expect(evaluate(chess)).toBe(-10000);
  });

  it('returns +10000 when black is checkmated', () => {
    // Back-rank mate — Ra8# already delivered, black to move in checkmate
    const chess = new Chess('R5k1/5ppp/8/8/8/8/8/6K1 b - - 0 1');
    expect(evaluate(chess)).toBe(10000);
  });

  it('returns positive score when white has more material', () => {
    const chess = new Chess('k7/8/8/8/8/8/8/KQ6 w - - 0 1');
    expect(evaluate(chess)).toBeGreaterThan(0);
  });

  it('returns negative score when black has more material', () => {
    const chess = new Chess('kq6/8/8/8/8/8/8/K7 w - - 0 1');
    expect(evaluate(chess)).toBeLessThan(0);
  });

  it('scores a centralised knight higher than a corner knight', () => {
    // Add a rook so neither position is drawn by insufficient material
    const corner = new Chess('7k/8/8/8/8/8/8/NR5K w - - 0 1');
    const centre = new Chess('7k/8/8/8/3N4/8/8/1R5K w - - 0 1');
    expect(evaluate(centre)).toBeGreaterThan(evaluate(corner));
  });
});

// ── getBestMove ───────────────────────────────────────────────────────────────

describe('getBestMove', () => {
  it('returns null when the game is already over', () => {
    const chess = new Chess('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    expect(getBestMove(chess, 'medium')).toBeNull();
  });

  it('returns a legal move in a normal position', () => {
    const chess = new Chess();
    const move = getBestMove(chess, 'easy');
    expect(typeof move).toBe('string');
    expect(chess.move(move)).not.toBeNull();
  });

  it('finds checkmate in 1 as white', () => {
    // Ra8# — rook delivers back-rank checkmate
    const chess = new Chess('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
    const move = getBestMove(chess, 'easy');
    chess.move(move);
    expect(chess.isCheckmate()).toBe(true);
  });

  it('finds checkmate in 1 as black', () => {
    // Fool's mate setup — black plays Qh4#
    const chess = new Chess('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2');
    const move = getBestMove(chess, 'easy');
    chess.move(move);
    expect(chess.isCheckmate()).toBe(true);
  });

  it('returns a valid move at every difficulty level', () => {
    // Use a simple endgame (few pieces = low branching factor) so hard/depth-5 stays fast
    const fen = 'k7/8/8/8/8/8/8/KR6 w - - 0 1';
    for (const difficulty of ['easy', 'medium', 'hard']) {
      const chess = new Chess(fen);
      const move = getBestMove(chess, difficulty);
      expect(typeof move).toBe('string');
      expect(new Chess(fen).move(move)).not.toBeNull();
    }
  });
});
