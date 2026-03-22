import { Chess } from '../lib/Chess.js';
import { getBestMove } from './ai.js';

self.onmessage = ({ data: { fen, difficulty, seq } }) => {
  const chess = new Chess(fen);
  const move = getBestMove(chess, difficulty);
  self.postMessage({ move, seq });
};
