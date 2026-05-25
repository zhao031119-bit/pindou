/**
 * Minimal bead motif for home cards.
 * Renders a tiny pixel arrangement using the card tone — replaces noisy illustrations.
 */

const motifs = {
  hero: [
    [0, 1, 1, 1, 0],
    [1, 2, 2, 2, 1],
    [1, 2, 3, 2, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 1, 1, 0]
  ],
  square: [
    [0, 1, 0],
    [1, 2, 1],
    [0, 1, 0]
  ],
  wide: [
    [0, 1, 2, 1, 0, 1, 2, 1, 0],
    [1, 2, 3, 2, 1, 2, 3, 2, 1],
    [0, 1, 2, 1, 0, 1, 2, 1, 0]
  ]
};

export default function CardMotif({ size = 'square' }) {
  const grid = motifs[size] || motifs.square;
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
