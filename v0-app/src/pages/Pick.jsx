import { useState } from 'react';
import { Loader, Search } from 'lucide-react';
import LoadingPixels from '../components/LoadingPixels.jsx';
import PaletteLogo from '../components/PaletteLogo.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { beadMatches, palettes } from '../data/palettes.js';

const currentColor = beadMatches[0]?.hex || '#D04F3F';

export default function Pick() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="page flow-page">
      <section className="card-feature pick-stage">
        <div className="sample-image">
          <span className="loupe">
            <Search size={20} />
          </span>
          <span className="sample-point" />
        </div>

        <div className="pick-current">
          <i style={{ background: currentColor }} />
          <div>
            <small>当前取样</small>
            <strong>{currentColor.toUpperCase()}</strong>
          </div>
          <span className="tag">已锁定</span>
        </div>
      </section>

      <SectionTitle
        label="匹配色号"
        action={<span>{loading ? '搜索中' : `${beadMatches.length} 项`}</span>}
      />

      {loading ? (
        <LoadingPixels label="正在识别豆色" hint="比对 580 + 个色号中…" />
      ) : (
        <section className="match-list stagger-in">
          {beadMatches.map((match, index) => {
            const palette = palettes.find((item) => item.id === match.brand);
            return (
              <article
                className="match-row"
                key={match.code}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <PaletteLogo id={match.brand} name={palette?.name || match.brand} swatches={palette?.swatches} />
                <i style={{ background: match.hex }} />
                <div>
                  <strong>{match.code}</strong>
                  <small>{match.name}</small>
                </div>
                <span className="match-score">
                  <em>{match.score}%</em>
                  <small>相似</small>
                </span>
              </article>
            );
          })}
        </section>
      )}

      <button
        type="button"
        className={loading ? 'dev-chip active' : 'dev-chip'}
        onClick={() => setLoading((v) => !v)}
      >
        <Loader size={11} />
        <span>{loading ? '识别中' : '加载态'}</span>
      </button>
    </div>
  );
}
