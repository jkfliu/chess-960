## Original Build Plan
https://claude.ai/public/artifacts/d9979e70-3266-4925-9fb4-b8b4993072ed

Chess960 React Artifact — Build Plan
Generated from planning session on Claude.ai. Use this to rebuild the project on any machine.

Architecture

Single React artifact using chess.js (with built-in Chess960 support)
Custom minimax + alpha-beta AI written in JS
Skinnable theme system via a THEMES object at the top — swapping skins = one prop change
No backend required — fully client-side


Dependencies

chess.js — board logic, move generation, Chess960 support, check/checkmate detection
React + hooks (useState, useEffect, useCallback)
Tailwind CSS (core utility classes only)
Unicode chess piece characters or SVG icons for pieces

Install for local dev:
bashnpm create vite@latest chess960 -- --template react
cd chess960
npm install chess.js
npm install -D tailwindcss
npm run dev

UI Layout
[ Mode: 1P / 2P ]  [ Difficulty ]  [ Position ID ]  [ New Game ]
┌─────────────────────────┬──────────────────────┐
│                         │  ♟ Captured Pieces   │
│      Chess Board        │  ────────────────    │
│   (8x8, SVG pieces,     │  📜 Move History     │
│    Chess960 start)      │  ────────────────    │
│                         │  [ ⟵ Undo Move ]    │
└─────────────────────────┴──────────────────────┘
            [ Status: "White to move" ]

Features
PriorityFeatureDetailP0Undo MoveReverts last 2 half-moves (human + AI ply)P0Captured PiecesShows pieces taken per side with material balanceP1Move HistoryAlgebraic notation, scrollable listP1DifficultyEasy / Medium / HardP1Game Mode1P vs Computer or 2P localP1Chess960 StartRandom position each new game, shows ID 0–959P1Position IDEnter a specific ID to replay a known setup

Chess960 Rules
RuleHandlingRandom back rankGenerated from 960 valid positionsCastlingKing always lands on g/c file — handled by chess.js automaticallyBishop constraintOne bishop on light square, one on dark squareKing constraintKing must start between the two rooksPosition IDDisplayed (0–959) so games are reproducible
Chess960 Position Generation Algorithm
1. Place dark-squared bishop on one of 4 dark squares (d1 index: 0-3)
2. Place light-squared bishop on one of 4 light squares (d2 index: 0-3)
3. Place queen on one of remaining 6 squares (q index: 0-5)
4. Place knights using table lookup (n index: 0-9, 10 combinations)
5. King goes in middle of remaining 3 squares, rooks on either side
Position ID = d1 + 4*d2 + 16*q + 96*n  (range 0-959)

AI Engine
Algorithm: Minimax + Alpha-Beta Pruning
jsfunction alphaBeta(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || chess.isGameOver()) return evaluate(chess);

  const moves = chess.moves();
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const score = alphaBeta(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // prune
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      chess.move(move);
      const score = alphaBeta(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // prune
    }
    return minScore;
  }
}
Evaluation Function

Material count: pawn=1, knight=3, bishop=3.25, rook=5, queen=9
Piece-square tables: bonuses for pieces on good squares (knights in center, etc.)
King safety: penalty for exposed king in middlegame

Difficulty Levels
LevelDepthNoiseBehaviourEasy1HighPlays mostly legal but weak movesMedium3LowSolid, beatable playHard5NoneFull alpha-beta, strong play

Skin / Theme System
Defined as a constant at the top of the file. Active theme passed as a prop — zero refactoring needed to add new skins.
jsconst THEMES = {
  clean: {
    lightSquare:  '#f0f0f0',
    darkSquare:   '#6a9fb5',
    highlight:    '#f6f669',
    background:   '#ffffff',
    text:         '#1a1a1a',
    panelBg:      '#f8f8f8',
    border:       '#dddddd',
  },
  wood: {
    lightSquare:  '#ffce9e',
    darkSquare:   '#d18b47',
    highlight:    '#cdd26a',
    background:   '#2c1a0e',
    text:         '#f5e6d3',
    panelBg:      '#3d2414',
    border:       '#6b3a1f',
  },
  neon: {
    lightSquare:  '#1a1a2e',
    darkSquare:   '#16213e',
    highlight:    '#00ff88',
    background:   '#0f0f1a',
    text:         '#00ffcc',
    panelBg:      '#12122a',
    border:       '#00ffcc',
  },
};
To add a new skin: add a new key to THEMES with the same fields. No other code changes needed.

Component Structure
<App>
  ├── <Toolbar>          — mode, difficulty, position ID, new game button
  ├── <Board>            — 8x8 grid, piece rendering, click/drag handling
  │     └── <Square>    — individual square with piece icon
  └── <Sidebar>
        ├── <CapturedPieces>   — grouped by side, shows material diff
        ├── <MoveHistory>      — scrollable algebraic notation list
        └── <UndoButton>       — reverts last human + AI move pair

State Shape
js{
  chess: Chess,           // chess.js instance (Chess960 mode)
  selectedSquare: null,   // currently clicked square
  gameMode: '1p',         // '1p' | '2p'
  playerColor: 'w',       // 'w' | 'b' (in 1p mode)
  difficulty: 'medium',   // 'easy' | 'medium' | 'hard'
  positionId: 0,          // Chess960 position ID (0-959)
  history: [],            // move history array
  capturedPieces: {       // pieces taken
    w: [],
    b: [],
  },
  status: '',             // status message string
  theme: 'clean',         // active theme key
}

TODO — Post MVP

 Board skins: wood, neon, marble  ✅ wood + Star Wars themes shipped
 Piece skin variants: Neo, Classic, 3D
 Highlight last move made on board  ✅ shipped
 Promotion piece selector UI (currently auto-promotes to queen)  ✅ shipped
 Opening book integration
 Transposition table for stronger AI
 Clock / time controls (blitz, rapid, classical)
 "Share position" link via position ID in URL hash
 Sound effects (move, capture, check)
 AI move delay based on difficulty
 Mobile touch drag support  ✅ shipped
 Export game as PGN  ✅ shipped


Notes

chess.js handles all rule enforcement including Chess960 castling edge cases
AI runs in a Web Worker (ai.worker.js) — UI stays responsive at all difficulty levels
Position ID display allows players to share and reproduce specific starting positions
Undo in 1P mode undoes both the player's move and the AI's response as a pair

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
