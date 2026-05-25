/**
 * Pixel motif for home cards. 16×16 pixel illustrations rendered via inline SVG.
 * Palette codes:
 *   .  = empty
 *   1  = soft tint (var --mt-1)
 *   2  = mid tone  (var --mt-2)
 *   3  = full tone (var --mt-3)
 *   o  = outline   (charcoal)
 *   k  = deep accent (charcoal-darker)
 *   w  = paper white
 */

const motifs = {
  // 生成图纸 — Polaroid photo: mountain + sun, with bottom paper border + grid hint
  generate: [
    'oooooooooooooooo',
    'owwwwwwwwwwwwwwo',
    'ow............wo',
    'ow.....333....wo',
    'ow....33333...wo',
    'ow...3333333..wo',
    'ow1.222.....22wo',
    'ow1.2.2.222.222o',
    'ow22222o222o222o',
    'ow2o22222o2o222o',
    'owooooooooooooo o'.replace(' ', ''),
    'owwwwwwwwwwwwwwo',
    'ow.3.3.w.2.2..wo',
    'ow.3.3.w.2.2..wo',
    'owwwwwwwwwwwwwwo',
    'oooooooooooooooo'
  ],

  // 识别色号 — Magnifying glass on a small color swatch (bigger lens, simpler handle)
  pick: [
    '...oooooooo.....',
    '..o........o....',
    '.o.wwwwwwww.o...',
    'o.w11122211w.o..',
    'o.w12233321w.o..',
    'o.w12333321w.o..',
    'o.w12333321w.o..',
    'o.w12333321w.o..',
    'o.w11233211w.o..',
    'o.wwwwwwwwww.oo.',
    '.o..........ooo.',
    '..oo........ooo.',
    '....oo......ooo.',
    '......oo....oo..',
    '........oo..o...',
    '..........ooo...'
  ],

  // 提取色号 — Color list: 4 stacked color swatches with text-line marks
  extract: [
    'oooooooooooooooo',
    'owwwwwwwwwwwwwwo',
    'ow333w.oooooo.wo',
    'ow333w........wo',
    'ow333w.oooooo.wo',
    'owwwwwwwwwwwwwwo',
    'ow222w.oooooo.wo',
    'ow222w........wo',
    'ow222w.oooooo.wo',
    'owwwwwwwwwwwwwwo',
    'ow111w.oooooo.wo',
    'ow111w........wo',
    'ow111w.oooooo.wo',
    'owwwwwwwwwwwwwwo',
    'owwwwwwwwwwwwwwo',
    'oooooooooooooooo'
  ],

  // 画豆图 — Pencil drawing on a pixel grid (left = grid being drawn, right = pencil)
  draw: [
    '..............oo',
    '.............ok.',
    '............ok3o',
    '...........ok33o',
    '..........ok333o',
    '.........ok3333o',
    '........ok33333o',
    'oooooooo.k3333oo',
    'o1.1.1.1ok33ooo.',
    'o.1.1.1.1k3oo...',
    'o1.1.1.1.oo.....',
    'o.1.1.1.1.o.....',
    'o1.1.1.1.1o.....',
    'o.1.1.1.1.o.....',
    'o1.1.1.1.1o.....',
    'oooooooooooo....'
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
  '3': 'var(--mt-3)',
  'o': 'var(--mt-out)',
  'k': 'var(--mt-dark)',
  'w': 'var(--paper)'
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
