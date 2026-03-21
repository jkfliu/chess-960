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
  playerColor, aiThinking,
  onModeChange, onDifficultyChange, onPositionIdLoad, onNewGame, onRandomGame,
  onThemeChange, onPlayerColorChange,
}) {
  return (
    <div
      className="flex flex-wrap items-end gap-6 px-6 py-4"
      style={{ backgroundColor: currentTheme.panelBg, borderBottom: `1px solid ${currentTheme.border}` }}
    >
      {/* Mode */}
      <Group label="Mode" currentTheme={currentTheme}>
        <Btn active={gameMode === '1p'} onClick={() => onModeChange('1p')} theme={currentTheme}>1P</Btn>
        <Btn active={gameMode === '2p'} onClick={() => onModeChange('2p')} theme={currentTheme}>2P</Btn>
      </Group>

      {/* Player color — 1P only */}
      {gameMode === '1p' && (
        <Group label="Play as" currentTheme={currentTheme}>
          <Btn active={playerColor === 'w'} onClick={() => onPlayerColorChange('w')} theme={currentTheme}>White</Btn>
          <Btn active={playerColor === 'b'} onClick={() => onPlayerColorChange('b')} theme={currentTheme}>Black</Btn>
        </Group>
      )}

      {/* Difficulty — 1P only */}
      {gameMode === '1p' && (
        <Group label="Difficulty" currentTheme={currentTheme}>
          {['easy', 'medium', 'hard'].map(d => (
            <Btn key={d} active={difficulty === d} onClick={() => onDifficultyChange(d)} theme={currentTheme}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Btn>
          ))}
        </Group>
      )}

      {/* Position ID */}
      <Group label="Position" currentTheme={currentTheme}>
        <input
          type="number"
          min={0}
          max={959}
          defaultValue={positionId}
          key={positionId}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const val = Math.max(0, Math.min(959, parseInt(e.target.value) || 0));
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

      {/* Theme */}
      <Group label="Theme" currentTheme={currentTheme}>
        {['clean', 'wood'].map(t => (
          <Btn key={t} active={themeName === t} onClick={() => onThemeChange(t)} theme={currentTheme}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Btn>
        ))}
      </Group>

      {/* Game actions */}
      <Group label="Game" currentTheme={currentTheme} >
        <Btn onClick={onRandomGame} theme={currentTheme}>Random</Btn>
        <Btn onClick={onNewGame} theme={currentTheme}>New Game</Btn>
      </Group>

      {/* AI thinking indicator */}
      {aiThinking && (
        <div className="flex flex-col justify-end pb-0.5 ml-auto">
          <span style={{ color: currentTheme.text, fontSize: 12, opacity: 0.5 }}>
            AI thinking…
          </span>
        </div>
      )}
    </div>
  );
}
