import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromotionPicker from './PromotionPicker.jsx';
import { THEMES } from '../themes/index.js';

const theme = THEMES.clean;

describe('PromotionPicker', () => {
  it('renders four promotion buttons', () => {
    render(<PromotionPicker color="w" toSquare="e8" flipped={false} onChoice={() => {}} theme={theme} />);
    expect(screen.getByTestId('promote-q')).toBeDefined();
    expect(screen.getByTestId('promote-r')).toBeDefined();
    expect(screen.getByTestId('promote-b')).toBeDefined();
    expect(screen.getByTestId('promote-n')).toBeDefined();
  });

  it('renders a backdrop', () => {
    render(<PromotionPicker color="w" toSquare="e8" flipped={false} onChoice={() => {}} theme={theme} />);
    expect(screen.getByTestId('promotion-backdrop')).toBeDefined();
  });

  it('calls onChoice with the selected piece', async () => {
    const onChoice = vi.fn();
    render(<PromotionPicker color="w" toSquare="e8" flipped={false} onChoice={onChoice} theme={theme} />);
    await userEvent.click(screen.getByTestId('promote-q'));
    expect(onChoice).toHaveBeenCalledWith('q');
  });

  it('calls onChoice with knight when N is clicked', async () => {
    const onChoice = vi.fn();
    render(<PromotionPicker color="b" toSquare="e1" flipped={false} onChoice={onChoice} theme={theme} />);
    await userEvent.click(screen.getByTestId('promote-n'));
    expect(onChoice).toHaveBeenCalledWith('n');
  });

  it('renders nothing when toSquare is null', () => {
    const { container } = render(
      <PromotionPicker color="w" toSquare={null} flipped={false} onChoice={() => {}} theme={theme} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when board is flipped', () => {
    const { container } = render(
      <PromotionPicker color="b" toSquare="e1" flipped={true} onChoice={() => {}} theme={theme} />
    );
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByTestId('promote-q')).toBeDefined();
  });

  it('highlights button on mouseenter and restores on mouseleave', async () => {
    render(<PromotionPicker color="w" toSquare="e8" flipped={false} onChoice={() => {}} theme={theme} />);
    const btn = screen.getByTestId('promote-q');
    const initial = btn.style.background;
    await userEvent.hover(btn);
    expect(btn.style.background).not.toBe(initial);
    await userEvent.unhover(btn);
    expect(btn.style.background).toBe(initial);
  });
});
