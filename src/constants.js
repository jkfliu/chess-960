export const POSITION_COUNT = 960;

export function randomPositionId() {
  return Math.floor(Math.random() * POSITION_COUNT);
}

// Conventional material values used for display (captured pieces, advantage)
export const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export const PIECE_GLYPHS = {
  w: { q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};
