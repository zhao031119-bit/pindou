import { Search } from 'lucide-react';
import PaletteLogo from '../components/PaletteLogo.jsx';
import { beadMatches, palettes } from '../data/palettes.js';

export default function Pick() {
  return (
    <div className="page flow-page">
      <section className="pick-stage">
        <div className="sample-image">
          <span className="loupe">
            <Search size={20} />
          </span>
          <span className="sample-point" />
        </div>
      </section>

      <section className="match-list">
        {beadMatches.map((match) => {
          const palette = palettes.find((item) => item.id === match.brand);
          return (
            <article className="match-row" key={match.code}>
              <PaletteLogo id={match.brand} name={palette?.name || match.brand} swatches={palette?.swatches} />
              <i style={{ background: match.hex }} />
              <div>
                <strong>{match.code}</strong>
                <small>{match.name}</small>
              </div>
              <span>{match.score}%</span>
            </article>
          );
        })}
      </section>
    </div>
  );
}
