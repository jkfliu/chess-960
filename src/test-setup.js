import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Ensure DOM is cleaned up between tests
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
