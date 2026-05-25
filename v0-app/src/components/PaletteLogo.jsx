export default function PaletteLogo({ id, name, swatches = [] }) {
  return (
    <span className="palette-logo" title={name}>
      <img src={`/miniprogram/assets/icons/palettes/${id}.png`} alt="" />
      <span className="palette-fallback">
        {swatches.slice(0, 4).map((color) => (
          <i key={color} style={{ background: color }} />
        ))}
      </span>
    </span>
  );
}
