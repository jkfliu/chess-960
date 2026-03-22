import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameOverModal from './GameOverModal.jsx';
import { THEMES } from '../themes/index.js';

const theme = THEMES.clean;

function makeChess(overrides = {}) {
  return {
    isGameOver: () => false,
    isCheckmate: () => false,
    isStalemate: () => false,
    isInsufficientMaterial: () => false,
    isThreefoldRepetition: () => false,
    turn: () => 'b',
    ...overrides,
  };
}

describe('GameOverModal', () => {
  it('renders nothing when game is not over', () => {
    const { container } = render(
      <GameOverModal chess={makeChess()} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows checkmate result with correct winner', () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => true, turn: () => 'b' });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    expect(screen.getByText('White wins')).toBeDefined();
    expect(screen.getByText('by checkmate')).toBeDefined();
  });

  it('shows black wins when white is in checkmate', () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => true, turn: () => 'w' });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    expect(screen.getByText('Black wins')).toBeDefined();
  });

  it('shows stalemate draw', () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => false, isStalemate: () => true });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    expect(screen.getByText('Draw')).toBeDefined();
    expect(screen.getByText('by stalemate')).toBeDefined();
  });

  it('shows insufficient material draw', () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => false, isStalemate: () => false, isInsufficientMaterial: () => true });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    expect(screen.getByText('insufficient material')).toBeDefined();
  });

  it('shows threefold repetition draw', () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => false, isStalemate: () => false, isInsufficientMaterial: () => false, isThreefoldRepetition: () => true });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    expect(screen.getByText('threefold repetition')).toBeDefined();
  });

  it('shows fifty-move rule draw as fallback', () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => false, isStalemate: () => false, isInsufficientMaterial: () => false, isThreefoldRepetition: () => false });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    expect(screen.getByText('fifty-move rule')).toBeDefined();
  });

  it('calls onNewGame when replay button is clicked', async () => {
    const onNewGame = vi.fn();
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => true, turn: () => 'b' });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={onNewGame} onRandomGame={() => {}} />);
    await userEvent.click(screen.getByText('Restart game'));
    expect(onNewGame).toHaveBeenCalled();
  });

  it('calls onRandomGame when random button is clicked', async () => {
    const onRandomGame = vi.fn();
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => true, turn: () => 'b' });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={onRandomGame} />);
    await userEvent.click(screen.getByText('Start new random game'));
    expect(onRandomGame).toHaveBeenCalled();
  });

  it('closes when × button is clicked', async () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => true, turn: () => 'b' });
    render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    await userEvent.click(screen.getByText('×'));
    expect(screen.queryByText('White wins')).toBeNull();
  });

  it('closes when backdrop is clicked', async () => {
    const chess = makeChess({ isGameOver: () => true, isCheckmate: () => true, turn: () => 'b' });
    const { container } = render(<GameOverModal chess={chess} theme={theme} onNewGame={() => {}} onRandomGame={() => {}} />);
    await userEvent.click(container.firstChild);
    expect(screen.queryByText('White wins')).toBeNull();
  });
});
