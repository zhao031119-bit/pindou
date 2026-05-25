import { Download, Eye, FolderPlus } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
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
  const total = beads.reduce((sum, b) => sum + b[2], 0);

  return (
    <div className="page flow-page">
      <StepIndicator steps={flowSteps} current="result" />

      <SectionTitle tone="berry" label="生成完成" hint="48 × 60 颗 · 5 种颜色" />

      <section className="result-preview">
        <button className="floating-eye" type="button">
          <Eye size={14} />
          <span>放大</span>
        </button>
        <PixelPreview cells={strawberryPattern} columns={8} />
      </section>

      <SectionTitle
        tone="clay"
        label="可选色卡"
        hint="切换品牌后下方清单会自动更新"
        action={<span>3 个品牌</span>}
      />

      <section className="palette-row">
        {palettes.map((palette, index) => (
          <button className={index === 0 ? 'palette-pill active' : 'palette-pill'} key={palette.id} type="button">
            <PaletteLogo id={palette.id} name={palette.name} swatches={palette.swatches} />
            <span>{palette.name}</span>
          </button>
        ))}
      </section>

      <SectionTitle
        tone="mint"
        label="豆子清单"
        hint={`合计 ${total} 颗`}
        action={<span>导出</span>}
      />

      <section className="bead-list">
        {beads.map(([name, color, count]) => (
          <div className="bead-row" key={name}>
            <i style={{ background: color }} />
            <span>{name}</span>
            <em className="bead-count">×{count}</em>
          </div>
        ))}
      </section>

      <BottomActionBar
        secondary={{ label: '加入作品', icon: <FolderPlus size={18} /> }}
        primary={{ label: '生成保存图', icon: <Download size={18} /> }}
      />
    </div>
  );
}
