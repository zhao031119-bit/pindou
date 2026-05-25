import { Search } from 'lucide-react';
import PaletteLogo from '../components/PaletteLogo.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { beadMatches, palettes } from '../data/palettes.js';

const currentColor = beadMatches[0]?.hex || '#D04F3F';

export default function Pick() {
  return (
    <div className="page flow-page">
      <SectionTitle tone="clay" label="拖动取色" hint="移动放大镜，对准要识别的位置" />

      <section className="pick-stage">
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
        tone="mint"
        label="匹配色号"
        hint="按相似度排序，已合并相近豆色"
        action={<span>{beadMatches.length} 项</span>}
      />

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
              <span className="match-score">
                <em>{match.score}%</em>
                <small>相似</small>
              </span>
            </article>
          );
        })}
      </section>
    </div>
  );
}
