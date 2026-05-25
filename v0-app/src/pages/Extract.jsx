import PaletteLogo from '../components/PaletteLogo.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { palettes } from '../data/palettes.js';
import { flowerPattern } from '../data/mockProjects.js';

const distribution = [
  { name: '玫瑰粉', color: '#E08A98', count: 56, ratio: 28 },
  { name: '叶子绿', color: '#7FB29A', count: 42, ratio: 22 },
  { name: '奶油白', color: '#F4E9D2', count: 38, ratio: 20 },
  { name: '深红', color: '#A83828', count: 32, ratio: 17 },
  { name: '柠黄', color: '#E8B649', count: 24, ratio: 13 }
];

export default function Extract() {
  return (
    <div className="page flow-page">
      <SectionTitle tone="butter" label="批量提取完成" hint="识别到 18 个主要颜色，已合并相近豆色" />

      <section className="extract-summary">
        <PixelPreview cells={flowerPattern} columns={8} />
        <div>
          <strong>192 颗 · 5 主色</strong>
          <small>覆盖率 96%，剩余像素已就近映射</small>
        </div>
      </section>

      <SectionTitle tone="berry" label="色卡频率" hint="占比从高到低排列" />

      <section className="freq-list">
        {distribution.map((item) => (
          <div className="freq-row" key={item.name}>
            <i style={{ background: item.color }} />
            <div className="freq-meta">
              <div className="freq-head">
                <strong>{item.name}</strong>
                <em>×{item.count}</em>
              </div>
              <span className="freq-track">
                <i style={{ width: `${item.ratio}%`, background: item.color }} />
              </span>
            </div>
            <span className="freq-ratio">{item.ratio}%</span>
          </div>
        ))}
      </section>

      <SectionTitle tone="clay" label="可匹配品牌" hint="点选切换匹配清单" />

      <section className="palette-cards">
        {palettes.slice(0, 3).map((palette) => (
          <article className="palette-card" key={palette.id}>
            <PaletteLogo id={palette.id} name={palette.name} swatches={palette.swatches} />
            <div>
              <strong>{palette.name}</strong>
              <small>{palette.count} 色可匹配</small>
            </div>
            <span className={palette.id === 'mard' ? 'tag' : 'tag tag-muted'}>
              {palette.id === 'mard' ? '推荐' : '可选'}
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}
