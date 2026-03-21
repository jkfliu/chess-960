import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CapturedPieces from './CapturedPieces.jsx';

const theme = { text: '#1a1a1a', border: '#ddd' };

const empty = { w: [], b: [] };

describe('CapturedPieces', () => {
  it('renders without crashing when no pieces are captured', () => {
    render(<CapturedPieces capturedPieces={empty} theme={theme} />);
    expect(screen.getByText(/captured pieces/i)).toBeDefined();
  });

  it('shows material advantage for white', () => {
    const captured = {
      w: [{ type: 'q', color: 'b' }, { type: 'p', color: 'b' }], // white captured 10pts
      b: [],
    };
    render(<CapturedPieces capturedPieces={captured} theme={theme} />);
    expect(screen.getByText('+10')).toBeDefined();
  });

  it('shows material advantage for black', () => {
    const captured = {
      w: [],
      b: [{ type: 'r', color: 'w' }, { type: 'r', color: 'w' }], // black captured 10pts
    };
    render(<CapturedPieces capturedPieces={captured} theme={theme} />);
    expect(screen.getByText('+10')).toBeDefined();
  });

  it('shows no advantage label when material is equal', () => {
    const captured = {
      w: [{ type: 'p', color: 'b' }],
      b: [{ type: 'p', color: 'w' }],
    };
    const { container } = render(<CapturedPieces capturedPieces={captured} theme={theme} />);
    expect(container.textContent).not.toContain('+');
  });
});
