import { useState } from 'react';
import { THEMES } from './themes/index.js';
import { randomPositionId } from './constants.js';
import { useChessGame } from './hooks/useChessGame.js';
import Board from './components/Board.jsx';
import PromotionPicker from './components/PromotionPicker.jsx';
import GameOverModal from './components/GameOverModal.jsx';
import Toolbar from './components/Toolbar.jsx';
import CapturedPieces from './components/CapturedPieces.jsx';
import MoveHistory from './components/MoveHistory.jsx';
import EvalBar from './components/EvalBar.jsx';

function getStatus(chess) {
  const turn = chess.turn();
  if (chess.isCheckmate()) return `Checkmate — ${turn === 'w' ? 'Black' : 'White'} wins`;
  if (chess.isStalemate()) return 'Stalemate — Draw';
  if (chess.isThreefoldRepetition()) return 'Threefold Repetition — Draw';
  if (chess.isInsufficientMaterial()) return 'Insufficient Material — Draw';
  if (chess.isDraw()) return 'Draw';
  if (chess.isCheck()) return `${turn === 'w' ? 'White' : 'Black'} is in check`;
  return `${turn === 'w' ? 'White' : 'Black'} to move`;
}

export default function App() {
  const [gameMode, setGameMode] = useState('1p');
  const [playerColor, setPlayerColor] = useState('w');
  const [difficulty, setDifficulty] = useState('medium');
  const [themeName, setThemeName] = useState('clean');

  const {
    chess, positionId, selectedSquare, legalMoves, lastMove,
    capturedPieces, aiThinking, pendingPromotion, resetGame,
    handleSquareClick, handlePromotionChoice, handleUndo,
  } = useChessGame({ gameMode, playerColor, difficulty });

  const currentTheme = THEMES[themeName];
  const flipped = gameMode === '1p' && playerColor === 'b';

  const handleModeChange = (mode) => {
    setGameMode(mode);
    resetGame(positionId);
  };

  const handlePlayerColorChange = (color) => {
    setPlayerColor(color);
    resetGame(positionId);
  };

  const history = chess.history();
  const status = getStatus(chess);
  const canUndo = history.length > 0 && !aiThinking;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
    >
      <Toolbar
        gameMode={gameMode}
        difficulty={difficulty}
        positionId={positionId}
        themeName={themeName}
        currentTheme={currentTheme}
        playerColor={playerColor}
        aiThinking={aiThinking}
        onModeChange={handleModeChange}
        onDifficultyChange={setDifficulty}
        onPositionIdLoad={resetGame}
        onNewGame={() => resetGame(positionId)}
        onRandomGame={() => resetGame(randomPositionId())}
        onThemeChange={setThemeName}
        onPlayerColorChange={handlePlayerColorChange}
      />

      <div className="flex flex-1 gap-6 p-6 items-start justify-center flex-wrap">
        {/* Board + eval bar */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
          <EvalBar chess={chess} theme={currentTheme} flipped={flipped} />
          <div style={{ width: '75vmin', minWidth: 240, position: 'relative' }}>
          <Board
            chess={chess}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            onSquareClick={handleSquareClick}
            theme={currentTheme}
            themeName={themeName}
            flipped={flipped}
          />
          {pendingPromotion && (
            <PromotionPicker
              color={chess.turn()}
              toSquare={pendingPromotion.to}
              flipped={flipped}
              onChoice={handlePromotionChoice}
              theme={currentTheme}
            />
          )}
          <GameOverModal
            chess={chess}
            theme={currentTheme}
            onNewGame={() => resetGame(positionId)}
            onRandomGame={() => resetGame(randomPositionId())}
          />
          </div>
        </div>

        {/* Sidebar */}
        <div
          className="flex flex-col gap-4 p-4 rounded min-w-48"
          style={{ backgroundColor: currentTheme.panelBg, border: `1px solid ${currentTheme.border}`, minWidth: 200 }}
        >
          <CapturedPieces capturedPieces={capturedPieces} theme={currentTheme} />

          <div style={{ borderTop: `1px solid ${currentTheme.border}`, paddingTop: 12 }}>
            <MoveHistory history={history} theme={currentTheme} />
          </div>

          <div style={{ borderTop: `1px solid ${currentTheme.border}`, paddingTop: 12 }}>
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              style={{
                backgroundColor: currentTheme.buttonBg,
                color: currentTheme.buttonText,
                border: `1px solid ${currentTheme.border}`,
                opacity: canUndo ? 1 : 0.4,
                cursor: canUndo ? 'pointer' : 'default',
                width: '100%',
              }}
              className="px-3 py-2 rounded text-sm font-medium"
            >
              ← Undo Move
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="text-center py-2 text-sm font-medium"
        style={{ backgroundColor: currentTheme.panelBg, borderTop: `1px solid ${currentTheme.border}` }}
      >
        {status}
      </div>
    </div>
  );
}
