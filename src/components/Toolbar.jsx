import { useEffect, useRef } from 'react';
import { clamp, BOARD_SIZE, POSITION_COUNT } from '../constants.js';

function Btn({ active, onClick, children, theme, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: active ? theme.activeButton : theme.buttonBg,
        color: active ? '#fff' : theme.buttonText,
        border: `1px solid ${theme.border}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
      className="px-3 py-1 rounded text-sm font-medium"
    >
      {children}
    </button>
  );
}

function Group({ label, currentTheme, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ color: currentTheme.text, fontSize: 10, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        {label}
      </span>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

export default function Toolbar({
  gameMode, difficulty, positionId, themeName, currentTheme,
  playerColor, aiThinking, boardSize,
  onModeChange, onDifficultyChange, onPositionIdLoad, onNewGame, onRandomGame,
  onThemeChange, onPlayerColorChange, onBoardSizeChange,
}) {
  const detailsRef = useRef(null);

  // Close on mobile after first paint (starts open to avoid layout shift on desktop)
  useEffect(() => {
    const isMobile = typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isMobile && detailsRef.current) detailsRef.current.open = false;
  }, []);

  const content = (
    <div
      className="flex flex-wrap items-end gap-4 px-6 py-2"
      style={{ backgroundColor: currentTheme.panelBg }}
    >
      <Group label="Mode" currentTheme={currentTheme}>
        <Btn active={gameMode === '1p'} onClick={() => onModeChange('1p')} theme={currentTheme}>1P</Btn>
        <Btn active={gameMode === '2p'} onClick={() => onModeChange('2p')} theme={currentTheme}>2P</Btn>
      </Group>

      {gameMode === '1p' && (
        <Group label="Play as" currentTheme={currentTheme}>
          <Btn active={playerColor === 'w'} onClick={() => onPlayerColorChange('w')} theme={currentTheme}>White</Btn>
          <Btn active={playerColor === 'b'} onClick={() => onPlayerColorChange('b')} theme={currentTheme}>Black</Btn>
        </Group>
      )}

      {gameMode === '1p' && (
        <Group label="Difficulty" currentTheme={currentTheme}>
          {['easy', 'medium', 'hard'].map(d => (
            <Btn key={d} active={difficulty === d} onClick={() => onDifficultyChange(d)} theme={currentTheme}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Btn>
          ))}
        </Group>
      )}

      <Group label="Position" currentTheme={currentTheme}>
        <input
          type="number"
          min={0}
          max={959}
          defaultValue={positionId}
          key={positionId}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const val = clamp(parseInt(e.target.value) || 0, 0, POSITION_COUNT - 1);
              onPositionIdLoad(val);
            }
          }}
          style={{
            width: 68,
            backgroundColor: currentTheme.buttonBg,
            color: currentTheme.buttonText,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 13,
          }}
        />
      </Group>

      <Group label="Theme" currentTheme={currentTheme}>
        {[['clean', 'Clean'], ['wood', 'Wood'], ['starwars', 'Star Wars']].map(([key, label]) => (
          <Btn key={key} active={themeName === key} onClick={() => onThemeChange(key)} theme={currentTheme}>
            {label}
          </Btn>
        ))}
      </Group>

      <Group label="Board Size" currentTheme={currentTheme}>
        <Btn onClick={() => onBoardSizeChange(boardSize - BOARD_SIZE.STEP)} theme={currentTheme} disabled={boardSize <= BOARD_SIZE.MIN}>−</Btn>
        <span style={{ color: currentTheme.text, fontSize: 13, minWidth: 36, textAlign: 'center', alignSelf: 'center' }}>{boardSize}%</span>
        <Btn onClick={() => onBoardSizeChange(boardSize + BOARD_SIZE.STEP)} theme={currentTheme} disabled={boardSize >= BOARD_SIZE.MAX}>+</Btn>
      </Group>

      <Group label="Game" currentTheme={currentTheme}>
        <Btn onClick={onNewGame} theme={currentTheme}>Restart</Btn>
        <Btn onClick={onRandomGame} theme={currentTheme}>Random</Btn>
      </Group>

      <div className="flex flex-col justify-end pb-0.5 ml-auto" style={{ visibility: aiThinking ? 'visible' : 'hidden' }}>
        <span style={{ color: currentTheme.text, fontSize: 12, opacity: 0.5 }}>
          AI thinking…
        </span>
      </div>
    </div>
  );

  return (
    <details
      ref={detailsRef}
      open
      style={{ borderBottom: `1px solid ${currentTheme.border}` }}
    >
      {/* Summary visible on mobile only (hidden via CSS on desktop) */}
      <summary
        className="toolbar-summary"
        style={{
          backgroundColor: currentTheme.panelBg,
          color: currentTheme.text,
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          listStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ⚙ Game Options
      </summary>
      {content}
    </details>
  );
}
