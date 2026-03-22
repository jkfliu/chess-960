const BTN_BASE = {
  borderRadius: 6,
  padding: '8px 18px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

import { useState } from 'react';

export default function GameOverModal({ chess, theme, onNewGame, onRandomGame }) {
  const [dismissed, setDismissed] = useState(false);
  if (!chess.isGameOver() || dismissed) return null;

  let title, subtitle;
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'Black' : 'White';
    title = `${winner} wins`;
    subtitle = 'by checkmate';
  } else if (chess.isStalemate()) {
    title = 'Draw';
    subtitle = 'by stalemate';
  } else if (chess.isInsufficientMaterial()) {
    title = 'Draw';
    subtitle = 'insufficient material';
  } else if (chess.isThreefoldRepetition()) {
    title = 'Draw';
    subtitle = 'threefold repetition';
  } else {
    title = 'Draw';
    subtitle = 'fifty-move rule';
  }

  return (
    <div
      onClick={() => setDismissed(true)}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 2,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          backgroundColor: theme.panelBg,
          border: `2px solid ${theme.border}`,
          borderRadius: 8,
          padding: '28px 36px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: 200,
        }}
      >
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: 'absolute',
            top: 8,
            right: 10,
            background: 'none',
            border: 'none',
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
            color: theme.text,
            opacity: 0.5,
            padding: '2px 4px',
          }}
        >
          ×
        </button>
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.text, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: theme.text, opacity: 0.65, marginBottom: 24 }}>
          {subtitle}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexDirection: 'column' }}>
          <button
            onClick={onNewGame}
            style={{ ...BTN_BASE, backgroundColor: theme.activeButton, color: '#fff', border: 'none' }}
          >
            Restart game
          </button>
          <button
            onClick={onRandomGame}
            style={{ ...BTN_BASE, backgroundColor: theme.buttonBg, color: theme.buttonText, border: `1px solid ${theme.border}` }}
          >
            Start new random game
          </button>
        </div>
      </div>
    </div>
  );
}
