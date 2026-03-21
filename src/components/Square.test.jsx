import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Square from './Square.jsx';

const theme = {
  lightSquare: '#f0f0f0',
  darkSquare:  '#6a9fb5',
  highlight:   '#f6f669',
  lastMove:    '#baca2b',
};

// jsdom normalises hex colours to rgb() in computed styles
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

describe('Square', () => {
  it('uses lightSquare colour for a light square', () => {
    const { container } = render(
      <Square isLight={true} theme={theme} onClick={() => {}} />
    );
    expect(container.firstChild.style.background).toContain(hexToRgb(theme.lightSquare));
  });

  it('uses darkSquare colour for a dark square', () => {
    const { container } = render(
      <Square isLight={false} theme={theme} onClick={() => {}} />
    );
    expect(container.firstChild.style.background).toContain(hexToRgb(theme.darkSquare));
  });

  it('uses highlight colour when selected', () => {
    const { container } = render(
      <Square isLight={true} isSelected={true} theme={theme} onClick={() => {}} />
    );
    expect(container.firstChild.style.background).toContain(hexToRgb(theme.highlight));
  });

  it('uses highlight colour for a legal move target', () => {
    const { container } = render(
      <Square isLight={false} isHighlight={true} theme={theme} onClick={() => {}} />
    );
    expect(container.firstChild.style.background).toContain(hexToRgb(theme.highlight));
  });

  it('uses lastMove colour for last-move squares', () => {
    const { container } = render(
      <Square isLight={true} isLastMove={true} theme={theme} onClick={() => {}} />
    );
    expect(container.firstChild.style.background).toContain(hexToRgb(theme.lastMove));
  });

  it('renders a piece SVG when a piece is present', () => {
    const { container } = render(
      <Square isLight={true} piece={{ type: 'k', color: 'w' }} theme={theme} onClick={() => {}} />
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders nothing inside when no piece', () => {
    const { container } = render(
      <Square isLight={true} piece={null} theme={theme} onClick={() => {}} />
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('calls onClick when clicked', async () => {
    const handler = vi.fn();
    const { container } = render(
      <Square isLight={true} theme={theme} onClick={handler} />
    );
    await userEvent.click(container.firstChild);
    expect(handler).toHaveBeenCalledOnce();
  });
});
