import { useState } from 'react';
import { Eye, ImageUp, Check, Image as ImageIcon } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StepIndicator from '../components/StepIndicator.jsx';
import SectionTitle from '../components/SectionTitle.jsx';

const flowSteps = [
  { id: 'upload', label: '裁剪' },
  { id: 'size', label: '尺寸' },
  { id: 'result', label: '图纸' }
];

export default function Upload({ goTo }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <div className="page flow-page">
      <StepIndicator steps={flowSteps} current="upload" />

      <SectionTitle
        tone="clay"
        label="主体取景"
        hint={hasImage ? '单指拖动，双指缩放，框选要拼的区域' : '从相册或拍照选取一张图开始'}
        action={
          <button
            className={hasImage ? 'section-toggle' : 'section-toggle active'}
            type="button"
            onClick={() => setHasImage((v) => !v)}
          >
            <ImageIcon size={12} />
            <span>{hasImage ? '空态预览' : '已选图'}</span>
          </button>
        }
      />

      {hasImage ? (
        <>
          <section className="crop-stage fade-in">
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

          <section className="ratio-row stagger-in">
            {[
              { id: '1:1', label: '1 : 1', hint: '头像' },
              { id: '4:5', label: '4 : 5', hint: '推荐', active: true },
              { id: 'free', label: '自由', hint: '裁切' }
            ].map((ratio, index) => (
              <button
                className={ratio.active ? 'ratio-pill active' : 'ratio-pill'}
                key={ratio.id}
                type="button"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <strong>{ratio.label}</strong>
                <span>{ratio.hint}</span>
              </button>
            ))}
          </section>
        </>
      ) : (
        <EmptyState
          illustration="search"
          title="先选一张图片"
          hint="支持相册照片或现拍现传，建议主体清晰、对比明显"
          action={
            <button className="empty-cta" type="button" onClick={() => setHasImage(true)}>
              <ImageUp size={16} />
              <span>从相册选择</span>
            </button>
          }
        />
      )}

      <BottomActionBar
        secondary={{ label: '换图片', icon: <ImageUp size={18} /> }}
        primary={{ label: '确认裁剪', icon: <Check size={18} />, onClick: () => goTo('size') }}
      />
    </div>
  );
}
