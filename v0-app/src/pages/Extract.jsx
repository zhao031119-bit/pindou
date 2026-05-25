import PaletteLogo from '../components/PaletteLogo.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import { palettes } from '../data/palettes.js';
import { flowerPattern } from '../data/mockProjects.js';

export default function Extract() {
  return (
    <div className="page flow-page">
      <section className="extract-summary">
        <PixelPreview cells={flowerPattern} columns={8} />
        <div>
          <strong>批量提取完成</strong>
          <small>识别到 18 个主要颜色，已合并相近豆色</small>
        </div>
      </section>

      <section className="palette-cards">
        {palettes.slice(0, 3).map((palette) => (
          <article className="palette-card" key={palette.id}>
            <PaletteLogo id={palette.id} name={palette.name} swatches={palette.swatches} />
            <div>
              <strong>{palette.name}</strong>
              <small>{palette.count} 色可匹配</small>
            </div>
            <span>{palette.id === 'mard' ? '推荐' : '可选'}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
