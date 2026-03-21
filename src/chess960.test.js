import { describe, it, expect } from 'vitest';
import { generateChess960Rank, positionToFen } from './chess960.js';

describe('generateChess960Rank', () => {
  it('produces exactly 8 pieces', () => {
    for (const id of [0, 1, 100, 518, 959]) {
      expect(generateChess960Rank(id)).toHaveLength(8);
    }
  });

  it('contains exactly the right set of pieces', () => {
    for (const id of [0, 1, 100, 518, 959]) {
      const rank = generateChess960Rank(id);
      const sorted = [...rank].sort().join('');
      expect(sorted).toBe('bbnnqkrr'.split('').sort().join(''));
    }
  });

  it('places the two bishops on opposite-colored squares', () => {
    for (let id = 0; id < 960; id++) {
      const rank = generateChess960Rank(id);
      const bishopFiles = rank.map((p, i) => p === 'b' ? i : -1).filter(i => i >= 0);
      expect(bishopFiles).toHaveLength(2);
      // Opposite colors means one on even file, one on odd file
      expect(bishopFiles[0] % 2).not.toBe(bishopFiles[1] % 2);
    }
  });

  it('places the king between the two rooks', () => {
    for (let id = 0; id < 960; id++) {
      const rank = generateChess960Rank(id);
      const kingFile = rank.indexOf('k');
      const rookFiles = rank.map((p, i) => p === 'r' ? i : -1).filter(i => i >= 0);
      expect(rookFiles).toHaveLength(2);
      expect(kingFile).toBeGreaterThan(rookFiles[0]);
      expect(kingFile).toBeLessThan(rookFiles[1]);
    }
  });

  it('SP 518 produces the standard chess back rank', () => {
    expect(generateChess960Rank(518).join('')).toBe('rnbqkbnr');
  });

  it('produces all 960 distinct positions', () => {
    const positions = new Set();
    for (let id = 0; id < 960; id++) {
      positions.add(generateChess960Rank(id).join(''));
    }
    expect(positions.size).toBe(960);
  });
});

describe('positionToFen', () => {
  it('produces a valid FEN string with 6 fields', () => {
    const fen = positionToFen(518);
    expect(fen.split(' ')).toHaveLength(6);
  });

  it('SP 518 FEN has standard castling rights', () => {
    const fen = positionToFen(518);
    expect(fen.split(' ')[2]).toBe('KQkq');
  });

  it('non-standard positions have no castling rights', () => {
    for (const id of [0, 1, 100, 200, 959]) {
      if (id === 518) continue;
      const fen = positionToFen(id);
      expect(fen.split(' ')[2]).toBe('-');
    }
  });

  it('white and black back ranks mirror each other', () => {
    for (const id of [0, 100, 518, 959]) {
      const fen = positionToFen(id);
      const ranks = fen.split(' ')[0].split('/');
      expect(ranks[0]).toBe(ranks[7].toLowerCase());
    }
  });

  it('FEN starts with black to move after white rank in correct order', () => {
    const fen = positionToFen(518);
    expect(fen).toContain('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });
});
