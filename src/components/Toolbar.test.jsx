import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toolbar from './Toolbar.jsx';

import { THEMES } from '../themes/index.js';

const baseProps = {
  gameMode:            '1p',
  difficulty:          'medium',
  positionId:          518,
  themeName:           'clean',
  currentTheme:        THEMES.clean,
  playerColor:         'w',
  aiThinking:          false,
  onModeChange:        vi.fn(),
  onDifficultyChange:  vi.fn(),
  onPositionIdLoad:    vi.fn(),
  onNewGame:           vi.fn(),
  onRandomGame:        vi.fn(),
  onThemeChange:       vi.fn(),
  onPlayerColorChange: vi.fn(),
};

describe('Toolbar', () => {
  it('renders all section labels', () => {
    render(<Toolbar {...baseProps} />);
    // Use exact text so parent containers (whose text includes button labels too) are not matched
    expect(screen.getByText('Mode')).toBeDefined();
    expect(screen.getByText('Play as')).toBeDefined();
    expect(screen.getByText('Difficulty')).toBeDefined();
    expect(screen.getByText('Position')).toBeDefined();
    expect(screen.getByText('Theme')).toBeDefined();
    expect(screen.getByText('Game')).toBeDefined();
  });

  it('shows Play As and Difficulty groups in 1P mode', () => {
    render(<Toolbar {...baseProps} gameMode="1p" />);
    expect(screen.getByRole('button', { name: 'White' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Easy' })).toBeDefined();
  });

  it('hides Play As and Difficulty groups in 2P mode', () => {
    render(<Toolbar {...baseProps} gameMode="2p" />);
    expect(screen.queryByRole('button', { name: 'White' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Easy' })).toBeNull();
  });

  it('calls onModeChange with "1p" when 1P is clicked', async () => {
    const onModeChange = vi.fn();
    render(<Toolbar {...baseProps} gameMode="2p" onModeChange={onModeChange} />);
    await userEvent.click(screen.getByRole('button', { name: '1P' }));
    expect(onModeChange).toHaveBeenCalledWith('1p');
  });

  it('calls onModeChange with "2p" when 2P is clicked', async () => {
    const onModeChange = vi.fn();
    render(<Toolbar {...baseProps} onModeChange={onModeChange} />);
    await userEvent.click(screen.getByRole('button', { name: '2P' }));
    expect(onModeChange).toHaveBeenCalledWith('2p');
  });

  it('calls onDifficultyChange when a difficulty is clicked', async () => {
    const onDifficultyChange = vi.fn();
    render(<Toolbar {...baseProps} onDifficultyChange={onDifficultyChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Hard' }));
    expect(onDifficultyChange).toHaveBeenCalledWith('hard');
  });

  it('calls onNewGame when New Game is clicked', async () => {
    const onNewGame = vi.fn();
    render(<Toolbar {...baseProps} onNewGame={onNewGame} />);
    await userEvent.click(screen.getByRole('button', { name: 'New Game' }));
    expect(onNewGame).toHaveBeenCalledOnce();
  });

  it('calls onRandomGame when Random is clicked', async () => {
    const onRandomGame = vi.fn();
    render(<Toolbar {...baseProps} onRandomGame={onRandomGame} />);
    await userEvent.click(screen.getByRole('button', { name: 'Random' }));
    expect(onRandomGame).toHaveBeenCalledOnce();
  });

  it('shows AI thinking indicator when aiThinking is true', () => {
    render(<Toolbar {...baseProps} aiThinking={true} />);
    expect(screen.getByText(/ai thinking/i)).toBeDefined();
  });

  it('hides AI thinking indicator when aiThinking is false', () => {
    render(<Toolbar {...baseProps} aiThinking={false} />);
    expect(screen.queryByText(/ai thinking/i)).toBeNull();
  });

  it('calls onThemeChange with "wood" when Wood is clicked', async () => {
    const onThemeChange = vi.fn();
    render(<Toolbar {...baseProps} onThemeChange={onThemeChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Wood' }));
    expect(onThemeChange).toHaveBeenCalledWith('wood');
  });

  it('calls onPlayerColorChange with "w" when White is clicked', async () => {
    const onPlayerColorChange = vi.fn();
    render(<Toolbar {...baseProps} playerColor="b" onPlayerColorChange={onPlayerColorChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'White' }));
    expect(onPlayerColorChange).toHaveBeenCalledWith('w');
  });

  it('calls onPlayerColorChange with "b" when Black is clicked', async () => {
    const onPlayerColorChange = vi.fn();
    render(<Toolbar {...baseProps} onPlayerColorChange={onPlayerColorChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Black' }));
    expect(onPlayerColorChange).toHaveBeenCalledWith('b');
  });

  it('calls onPositionIdLoad with parsed value on Enter', async () => {
    const onPositionIdLoad = vi.fn();
    render(<Toolbar {...baseProps} onPositionIdLoad={onPositionIdLoad} />);
    const input = screen.getByDisplayValue('518');
    await userEvent.clear(input);
    await userEvent.type(input, '100{Enter}');
    expect(onPositionIdLoad).toHaveBeenCalledWith(100);
  });
});
