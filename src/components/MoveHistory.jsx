import { useEffect, useRef } from 'react';

export default function MoveHistory({ history, theme }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Pair moves: [[w_move, b_move], ...]
  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1]]);
  }

  return (
    <div style={{ color: theme.text }}>
      <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-60">
        Move History
      </div>
      <div
        className="overflow-y-auto text-sm font-mono"
        style={{
          maxHeight: '180px',
          borderTop: `1px solid ${theme.border}`,
          paddingTop: '4px',
        }}
      >
        {pairs.length === 0 ? (
          <div className="opacity-40 text-xs py-1">No moves yet</div>
        ) : (
          pairs.map(([white, black], i) => (
            <div key={i} className="flex gap-2 py-0.5">
              <span className="opacity-40 w-6 text-right">{i + 1}.</span>
              <span className="w-16">{white}</span>
              <span className="w-16 opacity-70">{black ?? ''}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
