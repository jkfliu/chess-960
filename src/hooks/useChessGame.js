import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess } from '../lib/Chess.js';
import { positionToFen } from '../chess960.js';
import { randomPositionId } from '../constants.js';
import AIWorker from '../engine/ai.worker.js?worker';

function capturedFromHistory(chess) {
  const captured = { w: [], b: [] };
  for (const move of chess.history({ verbose: true })) {
    if (move.captured) {
      const capturedColor = move.color === 'w' ? 'b' : 'w';
      captured[move.color].push({ type: move.captured, color: capturedColor });
    }
  }
  return captured;
}

export function useChessGame({ gameMode, playerColor, difficulty }) {
  const initId = useRef(randomPositionId()).current;
  const chessRef = useRef(new Chess(positionToFen(initId)));

  const [tick, setTick] = useState(0);
  const [positionId, setPositionId] = useState(initId);
  const [startingFen, setStartingFen] = useState(() => positionToFen(initId));
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [aiThinking, setAiThinking] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState(null);

  const workerRef = useRef(null);
  const aiSeqRef = useRef(0);

  // ── Worker setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const worker = new AIWorker();
    workerRef.current = worker;

    worker.onmessage = ({ data: { move, seq } }) => {
      if (seq !== aiSeqRef.current) return;
      const c = chessRef.current;
      if (move) {
        const result = c.move(move);
        if (result) {
          setLastMove({ from: result.from, to: result.to });
          setCapturedPieces(capturedFromHistory(c));
        }
      }
      setAiThinking(false);
      setTick(t => t + 1);
    };

    return () => worker.terminate();
  }, []);

  // ── Reset game ──────────────────────────────────────────────────────────────
  const resetGame = useCallback((id) => {
    aiSeqRef.current++;
    const fen = positionToFen(id);
    chessRef.current = new Chess(fen);
    setPositionId(id);
    setStartingFen(fen);
    setCapturedPieces({ w: [], b: [] });
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setAiThinking(false);
    setPendingPromotion(null);
    setTick(t => t + 1);
  }, []);

  // ── AI effect ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const chess = chessRef.current;
    if (gameMode !== '1p') return;
    if (chess.isGameOver()) return;
    if (chess.turn() === playerColor) return;

    setAiThinking(true);
    const seq = ++aiSeqRef.current;

    const timer = setTimeout(() => {
      workerRef.current?.postMessage({ fen: chess.fen(), difficulty, seq });
    }, 200);

    return () => clearTimeout(timer);
  }, [tick, gameMode, playerColor, difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Square click ────────────────────────────────────────────────────────────
  const handleSquareClick = useCallback((square) => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return;
    if (aiThinking) return;
    if (pendingPromotion) return;
    if (gameMode === '1p' && chess.turn() !== playerColor) return;

    if (selectedSquare && legalMoves.includes(square)) {
      if (chess.isPromotion(selectedSquare, square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }
      const result = chess.move({ from: selectedSquare, to: square });
      if (result) {
        setLastMove({ from: result.from, to: result.to });
        setCapturedPieces(capturedFromHistory(chess));
        setSelectedSquare(null);
        setLegalMoves([]);
        setTick(t => t + 1);
        return;
      }
    }

    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      const moves = chess.moves({ square, verbose: true });
      setSelectedSquare(square);
      setLegalMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [selectedSquare, legalMoves, aiThinking, pendingPromotion, gameMode, playerColor]);

  // ── Promotion choice ─────────────────────────────────────────────────────────
  const handlePromotionChoice = useCallback((piece) => {
    if (!pendingPromotion) return;
    const chess = chessRef.current;
    const { from, to } = pendingPromotion;
    const result = chess.move({ from, to, promotion: piece });
    if (result) {
      setLastMove({ from: result.from, to: result.to });
      setCapturedPieces(capturedFromHistory(chess));
    }
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    setTick(t => t + 1);
  }, [pendingPromotion]);

  // ── Undo ────────────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    const chess = chessRef.current;
    if (chess.history().length === 0) return;
    chess.undo();
    if (gameMode === '1p' && chess.history().length > 0) chess.undo();
    setCapturedPieces(capturedFromHistory(chess));
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setAiThinking(false);
    setTick(t => t + 1);
  }, [gameMode]);

  const history = useMemo(() => chessRef.current.history(), [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    chess: chessRef.current,
    history,
    positionId,
    startingFen,
    selectedSquare,
    legalMoves,
    lastMove,
    capturedPieces,
    aiThinking,
    pendingPromotion,
    resetGame,
    handleSquareClick,
    handlePromotionChoice,
    handleUndo,
  };
}
