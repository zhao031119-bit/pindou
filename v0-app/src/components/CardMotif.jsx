/**
 * Pixel motif for home cards.
 * Each card gets a small pixel illustration that hints at the function.
 * Uses hard-edged squares (true pixel art) — no spherical bead highlights here.
 */

// Levels: 0 = empty, 1 = soft tint, 2 = mid tone, 3 = full tone, 4 = accent (charcoal-ish for outlines)
const motifs = {
  // hero card → camera + frame ("生成图纸": photo → grid)
  generate: [
    [0, 0, 4, 4, 4, 4, 4, 4, 0, 0],
    [0, 4, 1, 1, 1, 1, 1, 1, 4, 0],
    [4, 1, 2, 3, 3, 3, 3, 2, 1, 4],
    [4, 1, 3, 2, 2, 2, 2, 3, 1, 4],
    [4, 1, 3, 2, 1, 1, 2, 3, 1, 4],
    [4, 1, 3, 2, 2, 2, 2, 3, 1, 4],
    [4, 1, 2, 3, 3, 3, 3, 2, 1, 4],
    [0, 4, 1, 1, 1, 1, 1, 1, 4, 0],
    [0, 0, 4, 4, 4, 4, 4, 4, 0, 0]
  ],
  // square card → magnifier ("识别色号")
  pick: [
    [0, 0, 4, 4, 4, 0, 0, 0],
    [0, 4, 1, 2, 1, 4, 0, 0],
    [4, 1, 3, 3, 2, 1, 4, 0],
    [4, 2, 3, 3, 3, 2, 4, 0],
    [4, 1, 2, 3, 3, 1, 4, 0],
    [0, 4, 1, 2, 1, 4, 4, 0],
    [0, 0, 4, 4, 4, 4, 4, 0],
    [0, 0, 0, 0, 0, 4, 4, 4]
  ],
  // square card → color swatch list ("提取色号")
  extract: [
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 3, 3, 1, 1, 1, 1, 4],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 2, 2, 1, 1, 1, 1, 4],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 1, 1, 1, 1, 1, 1, 4],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  // wide card → pencil drawing on grid ("画豆图")
  draw: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0, 4, 3, 4, 0],
    [0, 1, 2, 2, 2, 1, 0, 4, 3, 3, 4, 0],
    [0, 1, 2, 3, 2, 1, 4, 3, 3, 4, 0, 0],
    [0, 1, 2, 2, 2, 1, 4, 4, 4, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 4, 0, 0, 0, 0, 0]
  ]
};

const motifByCardId = {
  upload: 'generate',
  pick: 'pick',
  extract: 'extract',
  draw: 'draw'
};

export default function CardMotif({ cardId = 'upload', size = 'square' }) {
  const key = motifByCardId[cardId] || 'generate';
  const grid = motifs[key];
  const cols = grid[0].length;
  const rows = grid.length;

  return (
    <span
      className={`card-motif card-motif-${size}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
      aria-hidden="true"
    >
      {grid.flat().map((level, i) => (
        <i key={i} className={level === 0 ? 'mt-empty' : `mt-l${level}`} />
      ))}
    </span>
  );
}
