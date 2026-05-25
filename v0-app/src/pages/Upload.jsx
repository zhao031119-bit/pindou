import { Eye, ImageUp } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';

export default function Upload({ goTo }) {
  return (
    <div className="page flow-page">
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
          <button className="floating-eye" type="button" aria-label="查看原图">
            <Eye size={18} />
          </button>
          <span className="crop-corner top-left" />
          <span className="crop-corner top-right" />
          <span className="crop-corner bottom-left" />
          <span className="crop-corner bottom-right" />
        </div>
      </section>

      <section className="panel compact-panel">
        <div>
          <strong>手动调整主体</strong>
          <small>单指拖动位置，双指缩放到合适画面</small>
        </div>
        <span className="tag">4:5 推荐</span>
      </section>

      <BottomActionBar
        secondary={{ label: '换图片', icon: <ImageUp size={18} /> }}
        primary={{ label: '确认裁剪', icon: <ImageUp size={18} />, onClick: () => goTo('size') }}
      />
    </div>
  );
}
