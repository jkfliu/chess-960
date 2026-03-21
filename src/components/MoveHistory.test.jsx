import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MoveHistory from './MoveHistory.jsx';

const theme = { text: '#1a1a1a', border: '#ddd' };

describe('MoveHistory', () => {
  it('shows "No moves yet" when history is empty', () => {
    render(<MoveHistory history={[]} theme={theme} />);
    expect(screen.getByText(/no moves yet/i)).toBeDefined();
  });

  it('renders move number labels', () => {
    render(<MoveHistory history={['e4', 'e5']} theme={theme} />);
    expect(screen.getByText('1.')).toBeDefined();
  });

  it('renders both white and black moves as a pair', () => {
    render(<MoveHistory history={['e4', 'e5']} theme={theme} />);
    expect(screen.getByText('e4')).toBeDefined();
    expect(screen.getByText('e5')).toBeDefined();
  });

  it('renders an unpaired white move without a black counterpart', () => {
    render(<MoveHistory history={['e4', 'e5', 'Nf3']} theme={theme} />);
    expect(screen.getByText('2.')).toBeDefined();
    expect(screen.getByText('Nf3')).toBeDefined();
  });

  it('renders multiple move pairs', () => {
    render(<MoveHistory history={['e4', 'e5', 'Nf3', 'Nc6']} theme={theme} />);
    expect(screen.getByText('1.')).toBeDefined();
    expect(screen.getByText('2.')).toBeDefined();
  });
});
