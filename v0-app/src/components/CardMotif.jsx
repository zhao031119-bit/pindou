/**
 * Pixel motif for home cards. 16×16 pixel illustrations rendered via inline SVG.
 * No black outline — uses 3 tone steps (l1 light → l3 dark) of the card's tone color.
 */

const motifs = {
  // 生成图纸 — Camera with shutter button (representing photo→pixel art)
  generate: [
    '................',
    '...22.......22..',
    '..2332222222332.',
    '.233333333333332',
    '.232222222222232',
    '.232.122221.2232',
    '.232.123321.2232',
    '.232.123321.2232',
    '.232.122221.2232',
    '.232222222222232',
    '.232222222222232',
    '.233333333333332',
    '.233333333333332',
    '..2333333333332.',
    '...222222222.2..',
    '................'
  ],

  // 识别色号 — Magnifying glass over a small color swatch
  pick: [
    '................',
    '....333333......',
    '...3222222.3....',
    '..3211111123....',
    '.32111221112.3..',
    '.31112332111.3..',
    '.31123333211.3..',
    '.31123333211.3..',
    '.31112332111.3..',
    '.32111221112.3..',
    '..3211111123....',
    '...3222222.3....',
    '....333333.33...',
    '...........333..',
    '............333.',
    '.............33.'
  ],

  // 提取色号 — Three color stripes with checkmarks
  extract: [
    '................',
    '................',
    '..33333333..3...',
    '..33333333.3....',
    '..33333333.3....',
    '...........3....',
    '..22222222..3...',
    '..22222222.3....',
    '..22222222.3....',
    '...........3....',
    '..11111111..3...',
    '..11111111.3....',
    '..11111111.3....',
    '...........3....',
    '................',
    '................'
  ],

  // 画豆图 — Pencil drawing on a pixel canvas
  draw: [
    '................',
    '......3333......',
    '......1111......',
    '......3333......',
    '......2222......',
    '......2222......',
    '......2222......',
    '......2222......',
    '......2222......',
    '......2222......',
    '......2222......',
    '.....322223.....',
    '.....322223.....',
    '......3333......',
    '.......33.......',
    '................'
  ]
};

const motifByCardId = {
  upload: 'generate',
  pick: 'pick',
  extract: 'extract',
  draw: 'draw'
};

const colorVar = {
  '1': 'var(--mt-1)',
  '2': 'var(--mt-2)',
  '3': 'var(--mt-3)'
};

export default function CardMotif({ cardId = 'upload', size = 'square' }) {
  const key = motifByCardId[cardId] || 'generate';
  const grid = motifs[key];
  const N = 16;

  return (
    <svg
      className={`card-motif card-motif-${size}`}
      viewBox={`0 0 ${N} ${N}`}
      width={N}
      height={N}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {grid.map((row, y) =>
        [...row].slice(0, N).map((ch, x) => {
          if (ch === '.' || !colorVar[ch]) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colorVar[ch]} />;
        })
      )}
    </svg>
  );
}
