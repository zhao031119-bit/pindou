export default function PixelCard({ card, onClick }) {
  return (
    <button className={`pixel-card ${card.size} tone-${card.tone}`} type="button" onClick={onClick}>
      <span className="card-glow" />
      <img className="card-art" src={card.image} alt="" />
      <span className="card-copy">
        <span className="accent-dot" />
        <strong>{card.title}</strong>
        <small>{card.subtitle}</small>
      </span>
    </button>
  );
}
