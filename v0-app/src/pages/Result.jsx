import { useState } from 'react';
import { Download, Eye, FolderPlus, Loader } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
import LoadingPixels from '../components/LoadingPixels.jsx';
import PaletteLogo from '../components/PaletteLogo.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { palettes } from '../data/palettes.js';
import { strawberryPattern } from '../data/mockProjects.js';

const flowSteps = [
  { id: 'upload', label: '裁剪' },
  { id: 'size', label: '尺寸' },
  { id: 'result', label: '图纸' }
];

const beads = [
  ['草莓红', '#D04F3F', 142],
  ['叶子绿', '#7FB29A', 28],
  ['深红阴影', '#A83828', 36],
  ['奶油白', '#F4E9D2', 48],
  ['深绿', '#5E9376', 22]
];

export default function Result() {
  const [loading, setLoading] = useState(false);
  const total = beads.reduce((sum, b) => sum + b[2], 0);

  return (
    <div className="page flow-page">
      <StepIndicator steps={flowSteps} current="result" />

      {loading ? (
        <LoadingPixels label="正在生成图纸" hint="像素聚类、色号匹配、生成清单…" />
      ) : (
        <>
          <section className="card-feature result-preview fade-in">
            <button className="floating-chip" type="button">
              <Eye size={13} />
              <span>放大</span>
            </button>
            <PixelPreview cells={strawberryPattern} columns={8} />
            <div className="result-caption">
              <strong>48 × 60 颗 · 5 色</strong>
              <span>合计 {total} 颗</span>
            </div>
          </section>

          <SectionTitle label="可选色卡" action={<span>3 个品牌</span>} />

          <section className="palette-row">
            {palettes.map((palette, index) => (
              <button className={index === 0 ? 'palette-pill active' : 'palette-pill'} key={palette.id} type="button">
                <PaletteLogo id={palette.id} name={palette.name} swatches={palette.swatches} />
                <span>{palette.name}</span>
              </button>
            ))}
          </section>

          <SectionTitle label="豆子清单" action={<span>导出</span>} />

          <section className="bead-list stagger-in">
            {beads.map(([name, color, count], index) => (
              <div className="bead-row" key={name} style={{ animationDelay: `${index * 60}ms` }}>
                <i style={{ background: color }} />
                <span>{name}</span>
                <em className="bead-count">×{count}</em>
              </div>
            ))}
          </section>
        </>
      )}

      <button
        type="button"
        className={loading ? 'dev-chip active' : 'dev-chip'}
        onClick={() => setLoading((v) => !v)}
      >
        <Loader size={11} />
        <span>{loading ? '生成中' : '加载态'}</span>
      </button>

      <BottomActionBar
        secondary={{ label: '加入作品', icon: <FolderPlus size={18} /> }}
        primary={{ label: '生成保存图', icon: <Download size={18} /> }}
      />
    </div>
  );
}
