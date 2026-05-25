import { Download, FolderPlus } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
import PaletteLogo from '../components/PaletteLogo.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import { palettes } from '../data/palettes.js';
import { strawberryPattern } from '../data/mockProjects.js';

export default function Result() {
  return (
    <div className="page flow-page">
      <section className="result-preview">
        <button className="floating-eye" type="button" aria-label="查看原图">
          <Download size={17} />
        </button>
        <PixelPreview cells={strawberryPattern} columns={8} />
      </section>

      <section className="palette-row">
        {palettes.map((palette, index) => (
          <button className={index === 0 ? 'palette-pill active' : 'palette-pill'} key={palette.id} type="button">
            <PaletteLogo id={palette.id} name={palette.name} swatches={palette.swatches} />
            <span>{palette.name}</span>
          </button>
        ))}
      </section>

      <section className="bead-list">
        {[
          ['草莓红', '#D04F3F', '142'],
          ['叶子绿', '#7FB29A', '28'],
          ['深红阴影', '#A83828', '36']
        ].map(([name, color, count]) => (
          <div className="bead-row" key={name}>
            <i style={{ background: color }} />
            <span>{name}</span>
            <strong>{count}</strong>
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
