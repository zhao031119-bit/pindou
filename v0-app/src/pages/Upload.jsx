import { Eye, ImageUp, Check } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import SectionTitle from '../components/SectionTitle.jsx';

const flowSteps = [
  { id: 'upload', label: '裁剪' },
  { id: 'size', label: '尺寸' },
  { id: 'result', label: '图纸' }
];

export default function Upload({ goTo }) {
  return (
    <div className="page flow-page">
      <StepIndicator steps={flowSteps} current="upload" />

      <SectionTitle tone="clay" label="主体取景" hint="单指拖动，双指缩放，框选要拼的区域" />

      <section className="crop-stage">
        <div className="photo-surface">
          <div className="pixel-photo">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <button className="floating-eye" type="button">
            <Eye size={14} />
            <span>原图</span>
          </button>
          <span className="crop-corner top-left" />
          <span className="crop-corner top-right" />
          <span className="crop-corner bottom-left" />
          <span className="crop-corner bottom-right" />
        </div>
      </section>

      <section className="ratio-row">
        {[
          { id: '1:1', label: '1 : 1', hint: '头像' },
          { id: '4:5', label: '4 : 5', hint: '推荐', active: true },
          { id: 'free', label: '自由', hint: '裁切' }
        ].map((ratio) => (
          <button
            className={ratio.active ? 'ratio-pill active' : 'ratio-pill'}
            key={ratio.id}
            type="button"
          >
            <strong>{ratio.label}</strong>
            <span>{ratio.hint}</span>
          </button>
        ))}
      </section>

      <BottomActionBar
        secondary={{ label: '换图片', icon: <ImageUp size={18} /> }}
        primary={{ label: '确认裁剪', icon: <Check size={18} />, onClick: () => goTo('size') }}
      />
    </div>
  );
}
