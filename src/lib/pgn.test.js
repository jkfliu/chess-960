import { describe, it, expect } from 'vitest';
import { buildPgn } from './pgn.js';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function makeChess({ isCheckmate = false, isDraw = false, turn = 'w' } = {}) {
  return { isCheckmate: () => isCheckmate, isDraw: () => isDraw, turn: () => turn };
}

function baseArgs(overrides = {}) {
  return {
    startingFen: STARTING_FEN,
    positionId: 518,
    moves: [],
    chess: makeChess(),
    gameMode: '1p',
    difficulty: 'medium',
    playerColor: 'w',
    ...overrides,
  };
}

// ── Headers ────────────────────────────────────────────────────────────────────

describe('buildPgn headers', () => {
  it('includes Event tag', () => {
    expect(buildPgn(baseArgs())).toContain('[Event "Chess960"]');
  });

  it('includes Date tag in YYYY.MM.DD format', () => {
    const pgn = buildPgn(baseArgs());
    expect(pgn).toMatch(/\[Date "\d{4}\.\d{2}\.\d{2}"\]/);
  });

  it('includes Variant tag', () => {
    expect(buildPgn(baseArgs())).toContain('[Variant "Chess960"]');
  });

  it('includes SetUp and FEN tags with the starting FEN', () => {
    const pgn = buildPgn(baseArgs());
    expect(pgn).toContain('[SetUp "1"]');
    expect(pgn).toContain(`[FEN "${STARTING_FEN}"]`);
  });

  it('includes Result tag', () => {
    expect(buildPgn(baseArgs())).toContain('[Result "');
  });
});

// ── Player names ───────────────────────────────────────────────────────────────

describe('buildPgn player names', () => {
  it('1p as white: White=Player, Black=AI', () => {
    const pgn = buildPgn(baseArgs({ gameMode: '1p', playerColor: 'w', difficulty: 'hard' }));
    expect(pgn).toContain('[White "Player"]');
    expect(pgn).toContain('[Black "AI (hard)"]');
  });

  it('1p as black: White=AI, Black=Player', () => {
    const pgn = buildPgn(baseArgs({ gameMode: '1p', playerColor: 'b', difficulty: 'easy' }));
    expect(pgn).toContain('[White "AI (easy)"]');
    expect(pgn).toContain('[Black "Player"]');
  });

  it('2p mode: both are Player', () => {
    const pgn = buildPgn(baseArgs({ gameMode: '2p' }));
    expect(pgn).toContain('[White "Player"]');
    expect(pgn).toContain('[Black "Player"]');
  });
});

// ── Result ─────────────────────────────────────────────────────────────────────

describe('buildPgn result', () => {
  it('1-0 when black is checkmated (turn b)', () => {
    const pgn = buildPgn(baseArgs({ chess: makeChess({ isCheckmate: true, turn: 'b' }) }));
    expect(pgn).toContain('[Result "1-0"]');
    expect(pgn).toMatch(/1-0\s*$/m);
  });

  it('0-1 when white is checkmated (turn w)', () => {
    const pgn = buildPgn(baseArgs({ chess: makeChess({ isCheckmate: true, turn: 'w' }) }));
    expect(pgn).toContain('[Result "0-1"]');
    expect(pgn).toMatch(/0-1\s*$/m);
  });

  it('1/2-1/2 on draw', () => {
    const pgn = buildPgn(baseArgs({ chess: makeChess({ isDraw: true }) }));
    expect(pgn).toContain('[Result "1/2-1/2"]');
    expect(pgn).toMatch(/1\/2-1\/2\s*$/m);
  });

  it('* for game in progress', () => {
    const pgn = buildPgn(baseArgs({ chess: makeChess() }));
    expect(pgn).toContain('[Result "*"]');
    expect(pgn).toMatch(/\*\s*$/m);
  });
});

// ── Move list ──────────────────────────────────────────────────────────────────

describe('buildPgn move list', () => {
  it('empty moves produces just the result token', () => {
    const pgn = buildPgn(baseArgs({ moves: [] }));
    expect(pgn).toMatch(/\n\n\*\n$/);
  });

  it('single white move', () => {
    const pgn = buildPgn(baseArgs({ moves: ['e4'] }));
    expect(pgn).toContain('1. e4 *');
  });

  it('one full move pair', () => {
    const pgn = buildPgn(baseArgs({ moves: ['e4', 'e5'] }));
    expect(pgn).toContain('1. e4 e5 *');
  });

  it('multiple move pairs', () => {
    const pgn = buildPgn(baseArgs({ moves: ['e4', 'e5', 'Nf3', 'Nc6'] }));
    expect(pgn).toContain('1. e4 e5 2. Nf3 Nc6 *');
  });

  it('odd number of moves (white has one more)', () => {
    const pgn = buildPgn(baseArgs({ moves: ['e4', 'e5', 'Nf3'] }));
    expect(pgn).toContain('1. e4 e5 2. Nf3 *');
  });

  it('appends result token to move text', () => {
    const pgn = buildPgn(baseArgs({
      moves: ['e4', 'e5'],
      chess: makeChess({ isCheckmate: true, turn: 'b' }),
    }));
    expect(pgn).toContain('1. e4 e5 1-0');
  });
});
