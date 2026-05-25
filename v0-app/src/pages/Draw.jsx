import { Eraser, Paintbrush, Undo2 } from 'lucide-react';
import PixelPreview from '../components/PixelPreview.jsx';
import { flowerPattern } from '../data/mockProjects.js';

export default function Draw() {
  return (
    <div className="page flow-page draw-page">
      <section className="draw-board">
        <PixelPreview cells={flowerPattern} columns={8} />
      </section>

      <section className="tool-dock">
        <button type="button" className="tool active" aria-label="画笔">
          <Paintbrush size={19} />
        </button>
        <button type="button" className="tool" aria-label="橡皮">
          <Eraser size={19} />
        </button>
        <button type="button" className="tool" aria-label="撤销">
          <Undo2 size={19} />
        </button>
        {['#D04F3F', '#F5C74E', '#7FB29A', '#5E9376'].map((color) => (
          <button className="color-dot" key={color} style={{ background: color }} type="button" aria-label={color} />
        ))}
      </section>
    </div>
  );
}
