import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { THEMES } from '../themes/index.js';

vi.mock('../engine/ai.js', () => ({ evaluate: vi.fn() }));
import { evaluate } from '../engine/ai.js';
import EvalBar from './EvalBar.jsx';

const theme = THEMES.clean;

function makeChess(overrides = {}) {
  return {
    isCheckmate: () => false,
    isDraw:      () => false,
    turn:        () => 'w',
    ...overrides,
  };
}

function barDivs(container) {
  const barContainer = container.firstChild.children[0];
  return [barContainer.children[0], barContainer.children[1]]; // [dark, light]
}

beforeEach(() => { evaluate.mockReset(); });

describe('EvalBar', () => {
  // ── Checkmate ───────────────────────────────────────────────────────────────

  it('shows M label on checkmate', () => {
    render(<EvalBar chess={makeChess({ isCheckmate: () => true })} theme={theme} flipped={false} />);
    expect(screen.getByText('M')).toBeDefined();
  });

  it('dark bar fills fully when white is mated (turn w)', () => {
    const { container } = render(
      <EvalBar chess={makeChess({ isCheckmate: () => true, turn: () => 'w' })} theme={theme} flipped={false} />
    );
    const [dark, light] = barDivs(container);
    expect(dark.style.height).toBe('100%');
    expect(light.style.height).toBe('0%');
  });

  it('light bar fills fully when black is mated (turn b)', () => {
    const { container } = render(
      <EvalBar chess={makeChess({ isCheckmate: () => true, turn: () => 'b' })} theme={theme} flipped={false} />
    );
    const [dark, light] = barDivs(container);
    expect(dark.style.height).toBe('0%');
    expect(light.style.height).toBe('100%');
  });

  it('does not call evaluate on checkmate', () => {
    render(<EvalBar chess={makeChess({ isCheckmate: () => true })} theme={theme} flipped={false} />);
    expect(evaluate).not.toHaveBeenCalled();
  });

  // ── Draw ────────────────────────────────────────────────────────────────────

  it('shows = label on draw', () => {
    render(<EvalBar chess={makeChess({ isDraw: () => true })} theme={theme} flipped={false} />);
    expect(screen.getByText('=')).toBeDefined();
  });

  it('bar is split 50/50 on draw', () => {
    const { container } = render(
      <EvalBar chess={makeChess({ isDraw: () => true })} theme={theme} flipped={false} />
    );
    const [dark, light] = barDivs(container);
    expect(dark.style.height).toBe('50%');
    expect(light.style.height).toBe('50%');
  });

  it('does not call evaluate on draw', () => {
    render(<EvalBar chess={makeChess({ isDraw: () => true })} theme={theme} flipped={false} />);
    expect(evaluate).not.toHaveBeenCalled();
  });

  // ── Normal positions ────────────────────────────────────────────────────────

  it('calls evaluate exactly once in a normal position', () => {
    evaluate.mockReturnValue(0);
    render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    expect(evaluate).toHaveBeenCalledTimes(1);
  });

  it('shows = label when eval is 0', () => {
    evaluate.mockReturnValue(0);
    render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    expect(screen.getByText('=')).toBeDefined();
  });

  it('shows + label for white advantage', () => {
    evaluate.mockReturnValue(400);
    render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    expect(screen.getByText('+4.0')).toBeDefined();
  });

  it('shows − label for black advantage', () => {
    evaluate.mockReturnValue(-300);
    render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    expect(screen.getByText('−3.0')).toBeDefined();
  });

  it('light bar is larger with white advantage', () => {
    evaluate.mockReturnValue(400);
    const { container } = render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    const [dark, light] = barDivs(container);
    expect(parseFloat(light.style.height)).toBeGreaterThan(parseFloat(dark.style.height));
  });

  it('dark bar is larger with black advantage', () => {
    evaluate.mockReturnValue(-400);
    const { container } = render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    const [dark, light] = barDivs(container);
    expect(parseFloat(dark.style.height)).toBeGreaterThan(parseFloat(light.style.height));
  });

  // ── Capping ─────────────────────────────────────────────────────────────────

  it('caps to full white bar when eval exceeds MAX_CP', () => {
    evaluate.mockReturnValue(1600);
    const { container } = render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    const [dark, light] = barDivs(container);
    expect(dark.style.height).toBe('0%');
    expect(light.style.height).toBe('100%');
  });

  it('caps to full dark bar when eval is below -MAX_CP', () => {
    evaluate.mockReturnValue(-1600);
    const { container } = render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    const [dark, light] = barDivs(container);
    expect(dark.style.height).toBe('100%');
    expect(light.style.height).toBe('0%');
  });

  // ── Flipped ─────────────────────────────────────────────────────────────────

  it('swaps bar sections when flipped', () => {
    evaluate.mockReturnValue(400);
    const { container: c1 } = render(<EvalBar chess={makeChess()} theme={theme} flipped={false} />);
    const { container: c2 } = render(<EvalBar chess={makeChess()} theme={theme} flipped={true} />);
    const [dark1, light1] = barDivs(c1);
    const [dark2, light2] = barDivs(c2);
    expect(dark1.style.height).toBe(light2.style.height);
    expect(light1.style.height).toBe(dark2.style.height);
  });
});
