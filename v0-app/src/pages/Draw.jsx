import { useState } from 'react';
import { Eraser, Grid3x3, Paintbrush, Redo2, Trash2, Undo2 } from 'lucide-react';
import PixelPreview from '../components/PixelPreview.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { flowerPattern } from '../data/mockProjects.js';

const colors = ['#D04F3F', '#E08A98', '#F5C74E', '#7FB29A', '#5E9376', '#8FB6D9', '#33302E', '#FFFAF3'];

export default function Draw() {
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#D04F3F');
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="page flow-page draw-page">
      <SectionTitle
        tone="clay"
        label="像素画板"
        hint="单格单击上色，长按可连涂"
        action={
          <button
            type="button"
            className={showGrid ? 'section-toggle active' : 'section-toggle'}
            onClick={() => setShowGrid((v) => !v)}
          >
            <Grid3x3 size={12} />
            <span>网格</span>
          </button>
        }
      />

      <section className={showGrid ? 'draw-board' : 'draw-board no-grid'}>
        <PixelPreview cells={flowerPattern} columns={8} />
      </section>

      <SectionTitle tone="mint" label="工具" />
      <section className="tool-dock">
        <button
          type="button"
          className={tool === 'brush' ? 'tool active' : 'tool'}
          aria-label="画笔"
          onClick={() => setTool('brush')}
        >
          <Paintbrush size={19} />
        </button>
        <button
          type="button"
          className={tool === 'eraser' ? 'tool active' : 'tool'}
          aria-label="橡皮"
          onClick={() => setTool('eraser')}
        >
          <Eraser size={19} />
        </button>
        <span className="tool-divider" />
        <button type="button" className="tool" aria-label="撤销">
          <Undo2 size={19} />
        </button>
        <button type="button" className="tool" aria-label="重做">
          <Redo2 size={19} />
        </button>
        <button type="button" className="tool" aria-label="清空">
          <Trash2 size={19} />
        </button>
      </section>

      <SectionTitle tone="butter" label="调色盘" hint="点选颜色后在画板上涂抹" />
      <section className="color-dock">
        {colors.map((c) => (
          <button
            className={color === c ? 'color-dot active' : 'color-dot'}
            key={c}
            style={{ background: c }}
            type="button"
            aria-label={c}
            onClick={() => setColor(c)}
          />
        ))}
      </section>
    </div>
  );
}
