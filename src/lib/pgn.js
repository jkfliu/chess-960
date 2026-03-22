export function buildPgn({ startingFen, moves, chess, gameMode, difficulty, playerColor }) {
  const isCheckmate = chess.isCheckmate();
  const isDraw      = chess.isDraw();

  const result = isCheckmate
    ? (chess.turn() === 'b' ? '1-0' : '0-1')
    : isDraw ? '1/2-1/2' : '*';

  const white = gameMode === '1p' && playerColor === 'b' ? `AI (${difficulty})` : 'Player';
  const black = gameMode === '1p' && playerColor === 'w' ? `AI (${difficulty})` : 'Player';

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  const headers = [
    `[Event "Chess960"]`,
    `[Date "${today}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`,
    `[Variant "Chess960"]`,
    `[SetUp "1"]`,
    `[FEN "${startingFen}"]`,
  ].join('\n');

  const moveText = moves.reduce((acc, san, i) => {
    if (i % 2 === 0) acc += `${Math.floor(i / 2) + 1}. `;
    return acc + san + ' ';
  }, '').trimEnd();

  const body = moveText ? `${moveText} ${result}` : result;

  return `${headers}\n\n${body}\n`;
}
