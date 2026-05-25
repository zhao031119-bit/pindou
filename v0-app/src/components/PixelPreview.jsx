export default function PixelPreview({ cells, columns = 8, compact = false }) {
  return (
    <div
      className={`pixel-preview ${compact ? 'compact' : ''}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      aria-hidden="true"
    >
      {cells.map((color, index) => (
        <span
          key={`${color || 'empty'}-${index}`}
          className={color ? 'pixel-cell' : 'pixel-cell empty'}
          style={color ? { background: color } : undefined}
        />
      ))}
    </div>
  );
}
