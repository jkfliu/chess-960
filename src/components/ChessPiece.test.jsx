import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ChessPiece from './ChessPiece.jsx';

const TYPES  = ['p', 'r', 'n', 'b', 'q', 'k'];
const COLORS = ['w', 'b'];

describe('ChessPiece', () => {
  it('renders an SVG for every piece type and color', () => {
    for (const color of COLORS) {
      for (const type of TYPES) {
        const { container } = render(<ChessPiece type={type} color={color} />);
        expect(container.querySelector('svg')).not.toBeNull();
      }
    }
  });

  it('uses a 45×45 viewBox', () => {
    const { container } = render(<ChessPiece type="k" color="w" />);
    expect(container.querySelector('svg').getAttribute('viewBox')).toBe('0 0 45 45');
  });

  it('includes gradient defs for white pieces', () => {
    const { container } = render(<ChessPiece type="q" color="w" />);
    expect(container.querySelector('defs radialGradient')).not.toBeNull();
  });

  it('includes gradient defs for black pieces', () => {
    const { container } = render(<ChessPiece type="q" color="b" />);
    expect(container.querySelector('defs radialGradient')).not.toBeNull();
  });

  it('includes a drop shadow filter', () => {
    const { container } = render(<ChessPiece type="p" color="w" />);
    expect(container.querySelector('feDropShadow')).not.toBeNull();
  });
});
