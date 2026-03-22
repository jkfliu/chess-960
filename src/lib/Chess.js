/**
 * Chess wrapper backed by chessops with Chess960 castling support.
 * Exposes the same API as chess.js so the rest of the codebase is unchanged.
 */
import { Chess as ChessopsChess } from 'chessops/variant';
import { parseFen, makeFen } from 'chessops/fen';
import { makeSan, parseSan } from 'chessops/san';
import { parseSquare, makeSquare } from 'chessops/util';

const ROLE = { pawn: 'p', knight: 'n', bishop: 'b', rook: 'r', queen: 'q', king: 'k' };
const ROLE_R = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const COL  = { white: 'w', black: 'b' };

function fromSetup(fen) {
  return ChessopsChess.fromSetup(parseFen(fen).unwrap(), { chess960: true }).unwrap();
}

function posFen(chess) {
  return makeFen(chess.toSetup()).split(' ').slice(0, 4).join(' ');
}

function isPromoSq(piece, toSq) {
  return piece?.role === 'pawn' &&
    ((piece.color === 'white' && (toSq >> 3) === 7) ||
     (piece.color === 'black' && (toSq >> 3) === 0));
}

function castleDest(san, color) {
  if (san === 'O-O')   return color === 'white' ? 'g1' : 'g8';
  if (san === 'O-O-O') return color === 'white' ? 'c1' : 'c8';
  return null;
}

export class Chess {
  constructor(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    this._chess = fromSetup(fen);
    this._stack = [];
    this._fenCounts = new Map([[posFen(this._chess), 1]]);
  }

  // ── Accessors ──────────────────────────────────────────────────────────────

  turn() { return COL[this._chess.turn]; }
  fen()  { return makeFen(this._chess.toSetup()); }

  get(square) {
    const piece = this._chess.board.get(parseSquare(square));
    return piece ? { type: ROLE[piece.role], color: COL[piece.color] } : null;
  }

  board() {
    const grid = Array.from({ length: 8 }, () => Array(8).fill(null));
    for (const [sq, piece] of this._chess.board) {
      grid[7 - (sq >> 3)][sq & 7] = { type: ROLE[piece.role], color: COL[piece.color] };
    }
    return grid;
  }

  // ── Move generation ────────────────────────────────────────────────────────

  moves(opts = {}) {
    const dests   = this._chess.allDests();
    const verbose = opts.verbose ?? false;
    const sqFilter = opts.square != null ? parseSquare(opts.square) : null;
    const result  = [];

    for (const [from, tos] of dests) {
      if (sqFilter !== null && from !== sqFilter) continue;
      const piece = this._chess.board.get(from);

      for (const to of tos) {
        const isPromo = isPromoSq(piece, to);

        const promos = isPromo ? ['q', 'n', 'r', 'b'] : [undefined];

        for (const promo of promos) {
          const move = promo ? { from, to, promotion: ROLE_R[promo] } : { from, to };
          const san  = makeSan(this._chess, move);

          if (verbose) {
            result.push({
              from: makeSquare(from),
              to:   makeSquare(to),
              san,
              color:     COL[this._chess.turn],
              piece:     ROLE[piece.role],
              promotion: promo,
            });
          } else {
            result.push(san);
          }
        }
      }
    }
    return result;
  }

  move(input) {
    let cm; // chessops Move

    if (typeof input === 'string') {
      cm = parseSan(this._chess, input);
      if (!cm) return null;
    } else {
      const from = parseSquare(input.from);
      const to   = parseSquare(input.to);
      if (!this._chess.allDests().get(from)?.has(to)) return null;
      const movPiece = this._chess.board.get(from);
      cm = { from, to, promotion: (input.promotion && isPromoSq(movPiece, to)) ? ROLE_R[input.promotion] : undefined };
    }

    const prevColor = this._chess.turn; // 'white' | 'black'
    const captured  = this._chess.board.get(cm.to);

    const movingPiece = this._chess.board.get(cm.from);
    const isEnPassant = movingPiece?.role === 'pawn' &&
      (cm.from & 7) !== (cm.to & 7) && !captured;

    const savedPos = this._chess.clone();
    const san = makeSan(this._chess, cm);
    this._chess.play(cm);

    const toSquare = castleDest(san, prevColor) ?? makeSquare(cm.to);

    const verbose = {
      from:      makeSquare(cm.from),
      to:        toSquare,
      san,
      color:     COL[prevColor],
      piece:     ROLE[movingPiece?.role],
      captured:  isEnPassant ? 'p' : (captured ? ROLE[captured.role] : undefined),
      promotion: cm.promotion ? ROLE[cm.promotion] : undefined,
    };

    this._stack.push({ position: savedPos, verbose });
    const f = posFen(this._chess);
    this._fenCounts.set(f, (this._fenCounts.get(f) ?? 0) + 1);
    return verbose;
  }

  // ── Undo ───────────────────────────────────────────────────────────────────

  undo() {
    const last = this._stack.pop();
    if (!last) return null;
    const f = posFen(this._chess);
    const cnt = this._fenCounts.get(f) ?? 0;
    if (cnt <= 1) this._fenCounts.delete(f); else this._fenCounts.set(f, cnt - 1);
    this._chess = last.position;
    return last.verbose;
  }

  // ── History ────────────────────────────────────────────────────────────────

  history(opts = {}) {
    return opts.verbose
      ? this._stack.map(h => h.verbose)
      : this._stack.map(h => h.verbose.san);
  }

  // ── Game-state queries ─────────────────────────────────────────────────────

  isPromotion(from, to) {
    const piece = this._chess.board.get(parseSquare(from));
    if (piece?.role !== 'pawn') return false;
    const toRank = to[1];
    return (piece.color === 'white' && toRank === '8') ||
           (piece.color === 'black' && toRank === '1');
  }

  isCheck()              { return this._chess.isCheck(); }
  isCheckmate()          { return this._chess.isCheckmate(); }
  isStalemate()          { return this._chess.isStalemate(); }
  isInsufficientMaterial() {
    return this._chess.hasInsufficientMaterial('white') &&
           this._chess.hasInsufficientMaterial('black');
  }
  isThreefoldRepetition() {
    return (this._fenCounts.get(posFen(this._chess)) ?? 0) >= 3;
  }
  isDraw() {
    return this.isStalemate() ||
           this.isInsufficientMaterial() ||
           this.isThreefoldRepetition() ||
           this._chess.toSetup().halfmoves >= 100;
  }
  isGameOver() {
    return this.isCheckmate() || this.isDraw();
  }
}
