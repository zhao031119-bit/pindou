import { WandSparkles } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';

export default function Size({ goTo }) {
  return (
    <div className="page flow-page">
      <section className="panel size-panel">
        <div className="panel-title">
          <strong>自定义尺寸</strong>
          <small>按颗数填写宽高，减少大段推荐文案</small>
        </div>
        <div className="size-inputs">
          <label>
            <span>宽</span>
            <input value="48" readOnly />
          </label>
          <label>
            <span>高</span>
            <input value="60" readOnly />
          </label>
        </div>
      </section>

      <section className="recommend-row">
        {['头像', '挂件', '摆台'].map((item, index) => (
          <button className={index === 1 ? 'recommend active' : 'recommend'} key={item} type="button">
            <strong>{item}</strong>
            <span>{index === 0 ? '40 x 40' : index === 1 ? '48 x 60' : '72 x 72'}</span>
          </button>
        ))}
      </section>

      <section className="preview-board">
        <span className="board-ratio">48 x 60</span>
        <div className="ghost-grid" />
      </section>

      <BottomActionBar
        primary={{ label: '生成图纸', icon: <WandSparkles size={18} />, onClick: () => goTo('result') }}
      />
    </div>
  );
}
