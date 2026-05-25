import { useState } from 'react';
import { WandSparkles, Minus, Plus } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import SectionTitle from '../components/SectionTitle.jsx';

const flowSteps = [
  { id: 'upload', label: '裁剪' },
  { id: 'size', label: '尺寸' },
  { id: 'result', label: '图纸' }
];

const presets = [
  { id: 'avatar', label: '头像', w: 40, h: 40 },
  { id: 'pendant', label: '挂件', w: 48, h: 60 },
  { id: 'frame', label: '摆台', w: 72, h: 72 }
];

export default function Size({ goTo }) {
  const [preset, setPreset] = useState('pendant');
  const [width, setWidth] = useState(48);
  const [height, setHeight] = useState(60);

  const apply = (id, w, h) => {
    setPreset(id);
    setWidth(w);
    setHeight(h);
  };

  const beadCount = width * height;
  const realCm = `${(width * 0.5).toFixed(1)} × ${(height * 0.5).toFixed(1)} cm`;

  return (
    <div className="page flow-page">
      <StepIndicator steps={flowSteps} current="size" />

      <section className="card-feature size-hero">
        <div className="size-hero-stat">
          <small>预估颗数</small>
          <strong>{beadCount.toLocaleString()}</strong>
          <em>{realCm}</em>
        </div>
        <div className="size-hero-aside">
          <small>预估价格</small>
          <strong>¥{(beadCount * 0.05).toFixed(0)}</strong>
        </div>
      </section>

      <SectionTitle label="尺寸" />

      <section className="size-inputs">
        <label>
          <span>宽 (颗)</span>
          <div className="stepper">
            <button type="button" onClick={() => setWidth((v) => Math.max(8, v - 1))} aria-label="减">
              <Minus size={14} />
            </button>
            <input
              value={width}
              onChange={(e) => setWidth(Number(e.target.value) || 0)}
              inputMode="numeric"
            />
            <button type="button" onClick={() => setWidth((v) => Math.min(200, v + 1))} aria-label="加">
              <Plus size={14} />
            </button>
          </div>
        </label>
        <label>
          <span>高 (颗)</span>
          <div className="stepper">
            <button type="button" onClick={() => setHeight((v) => Math.max(8, v - 1))} aria-label="减">
              <Minus size={14} />
            </button>
            <input
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) || 0)}
              inputMode="numeric"
            />
            <button type="button" onClick={() => setHeight((v) => Math.min(200, v + 1))} aria-label="加">
              <Plus size={14} />
            </button>
          </div>
        </label>
      </section>

      <SectionTitle label="尺寸预设" />

      <section className="recommend-row">
        {presets.map((item) => (
          <button
            className={preset === item.id ? 'recommend active' : 'recommend'}
            key={item.id}
            type="button"
            onClick={() => apply(item.id, item.w, item.h)}
          >
            <strong>{item.label}</strong>
            <span>{item.w} × {item.h}</span>
          </button>
        ))}
      </section>

      <SectionTitle label="比例预览" action={<span>{width} × {height}</span>} />

      <section className="preview-board">
        <div
          className="ghost-grid"
          style={{
            width: `min(180px, ${(width / Math.max(width, height)) * 180}px)`,
            height: `min(180px, ${(height / Math.max(width, height)) * 180}px)`
          }}
        />
      </section>

      <BottomActionBar
        primary={{ label: '生成图纸', icon: <WandSparkles size={18} />, onClick: () => goTo('result') }}
      />
    </div>
  );
}
