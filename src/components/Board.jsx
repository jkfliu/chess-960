import { useState, useEffect, useRef } from 'react';
import Square from './Square';
import ChessPiece from './ChessPiece.jsx';
import { FILES, RANKS } from '../constants.js';

// Fixed star positions so they don't shift on every render
const STARS = Array.from({ length: 50 }, (_, i) => {
  const a = Math.sin(i * 127.1) * 43758.5453;
  const b = Math.sin(i * 311.7) * 43758.5453;
  const c = Math.sin(i * 74.3)  * 43758.5453;
  return {
    x: ((a - Math.floor(a)) * 100).toFixed(2),
    y: ((b - Math.floor(b)) * 100).toFixed(2),
    r: (0.5 + (c - Math.floor(c)) * 1.5).toFixed(2),
    o: (0.15 + (a - Math.floor(a)) * 0.25).toFixed(2),
  };
});

export default function Board({ chess, selectedSquare, legalMoves, lastMove, onSquareClick, theme, themeName, flipped }) {
  const board = chess.board();

  const [shootingStar, setShootingStar] = useState(null);
  const timerRef     = useRef(null);
  const hideStarRef  = useRef(null);

  useEffect(() => {
    if (themeName !== 'starwars') { setShootingStar(null); return; }
    const schedule = () => {
      timerRef.current = setTimeout(() => {
        setShootingStar({ x: 5 + Math.random() * 75, y: 5 + Math.random() * 50, key: Date.now() });
        hideStarRef.current = setTimeout(() => setShootingStar(null), 700);
        schedule();
      }, 3000 + Math.random() * 6000);
    };
    schedule();
    return () => { clearTimeout(timerRef.current); clearTimeout(hideStarRef.current); };
  }, [themeName]);

  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  // ── Touch drag ──────────────────────────────────────────────────────────────
  const boardRef    = useRef(null);
  const ghostRef    = useRef(null);
  const [dragFrom,  setDragFrom]  = useState(null);
  const [dragPiece, setDragPiece] = useState(null);

  // Always-fresh ref so event listeners never go stale
  const dataRef = useRef(null);
  dataRef.current = { board, files, ranks, onSquareClick, chess };

  useEffect(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;

    let touchDownSq = null;
    let isDragging  = false;
    let startX = 0, startY = 0;

    function squareAt(clientX, clientY) {
      const rect = boardEl.getBoundingClientRect();
      const { files: f, ranks: r } = dataRef.current;
      const size = rect.width / 8;
      const fi = Math.floor((clientX - rect.left) / size);
      const ri = Math.floor((clientY - rect.top)  / size);
      if (fi < 0 || fi > 7 || ri < 0 || ri > 7) return null;
      return `${f[fi]}${r[ri]}`;
    }

    function onTouchStart(e) {
      const touch = e.touches[0];
      const sq = squareAt(touch.clientX, touch.clientY);
      if (!sq) return;
      const { board: b, chess: c } = dataRef.current;
      const rank = 8 - parseInt(sq[1]);
      const file = FILES.indexOf(sq[0]);
      const piece = b[rank]?.[file];
      if (!piece || piece.color !== c.turn()) return;
      e.preventDefault();
      touchDownSq = sq;
      startX = touch.clientX;
      startY = touch.clientY;
    }

    function onTouchMove(e) {
      if (!touchDownSq) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (!isDragging) {
        if (Math.abs(touch.clientX - startX) + Math.abs(touch.clientY - startY) < 8) return;
        isDragging = true;
        const { board: b, onSquareClick: osc } = dataRef.current;
        const rank = 8 - parseInt(touchDownSq[1]);
        const file = FILES.indexOf(touchDownSq[0]);
        const piece = b[rank]?.[file];
        if (piece) {
          setDragPiece(piece);
          setDragFrom(touchDownSq);
          osc(touchDownSq); // highlight legal moves
        }
      }
      if (isDragging && ghostRef.current) {
        const size = boardEl.getBoundingClientRect().width / 8;
        ghostRef.current.style.display = 'block';
        ghostRef.current.style.left    = `${touch.clientX}px`;
        ghostRef.current.style.top     = `${touch.clientY}px`;
        ghostRef.current.style.width   = `${size}px`;
        ghostRef.current.style.height  = `${size}px`;
      }
    }

    function onTouchEnd(e) {
      const touch = e.changedTouches[0];
      if (isDragging) {
        e.preventDefault();
        isDragging = false;
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        setDragFrom(null);
        setDragPiece(null);
        const toSq = squareAt(touch.clientX, touch.clientY);
        if (toSq) dataRef.current.onSquareClick(toSq);
      } else if (touchDownSq) {
        // Tap: e.preventDefault() on touchstart suppressed the synthetic click, so fire manually
        dataRef.current.onSquareClick(touchDownSq);
      }
      touchDownSq = null;
    }

    boardEl.addEventListener('touchstart', onTouchStart, { passive: false });
    boardEl.addEventListener('touchmove',  onTouchMove,  { passive: false });
    boardEl.addEventListener('touchend',   onTouchEnd,   { passive: false });
    return () => {
      boardEl.removeEventListener('touchstart', onTouchStart);
      boardEl.removeEventListener('touchmove',  onTouchMove);
      boardEl.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  return (
    <div
      className="relative"
      style={{
        border: `2px solid ${theme.border}`,
        userSelect: 'none',
      }}
    >
      <div ref={boardRef} className="grid grid-cols-8" style={{ touchAction: 'none' }}>
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
                isDragging={dragFrom === square}
                onClick={() => onSquareClick(square)}
                theme={theme}
              />
            );
          })
        )}
      </div>

      {/* Ghost piece follows finger during drag */}
      <div
        ref={ghostRef}
        style={{
          display: 'none',
          position: 'fixed',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {dragPiece && <ChessPiece type={dragPiece.type} color={dragPiece.color} />}
      </div>

      {themeName === 'starwars' && (
        <>
          <style>{`
            @keyframes shooting-star {
              from { opacity: 0.9; transform: rotate(30deg) translateX(0); }
              to   { opacity: 0;   transform: rotate(30deg) translateX(90px); }
            }
          `}</style>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {STARS.map((s, i) => (
              <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o} />
            ))}
          </svg>
          {shootingStar && (
            <div
              key={shootingStar.key}
              style={{
                position: 'absolute',
                left: `${shootingStar.x}%`,
                top: `${shootingStar.y}%`,
                width: 90,
                height: 1.5,
                background: 'linear-gradient(to right, transparent, #ffe566)',
                borderRadius: 1,
                pointerEvents: 'none',
                zIndex: 11,
                animation: 'shooting-star 0.7s ease-out forwards',
              }}
            />
          )}
        </>
      )}

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
