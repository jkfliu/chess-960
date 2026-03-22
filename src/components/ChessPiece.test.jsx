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

  it('applies drop-shadow filter style', () => {
    const { container } = render(<ChessPiece type="k" color="w" />);
    expect(container.querySelector('svg').style.filter).toContain('drop-shadow');
  });

  it('uses ivory fill for white pieces', () => {
    const { container } = render(<ChessPiece type="q" color="w" />);
    // jsdom normalises hex to rgb() in inline styles
    expect(container.querySelector('svg').innerHTML).toContain('rgb(245, 240, 224)');
  });

  it('uses dark fill for black pieces', () => {
    const { container } = render(<ChessPiece type="q" color="b" />);
    expect(container.querySelector('svg').innerHTML).toContain('rgb(46, 46, 46)');
  });
});
