import { Download, FolderPlus, Pencil } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { mockProjects } from '../data/mockProjects.js';

const beads = [
  { name: '草莓红', color: '#D04F3F', count: 142 },
  { name: '叶子绿', color: '#7FB29A', count: 28 },
  { name: '深红阴影', color: '#A83828', count: 36 }
];

const history = [
  { time: '今天 14:22', label: '更新调色板' },
  { time: '昨天 21:08', label: '完成草莓主体' },
  { time: '4 月 12 日', label: '创建图纸' }
];

export default function Detail() {
  const project = mockProjects[0];

  return (
    <div className="page flow-page">
      <section className="detail-hero">
        <PixelPreview cells={project.cells} columns={8} />
        <div>
          <strong>{project.name}</strong>
          <small>
            {project.type} · {project.size} · {project.palette}
          </small>
          <span className="progress-track">
            <i style={{ width: `${project.progress}%` }} />
          </span>
          <span className="detail-progress">完成度 {project.progress}%</span>
        </div>
      </section>

      <section className="stats-grid">
        {[
          ['颜色', '8'],
          ['颗数', '206'],
          ['尺寸', project.size]
        ].map(([label, value]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <SectionTitle tone="clay" label="豆子清单" hint="按用量排序" />
      <section className="bead-list">
        {beads.map((b) => (
          <div className="bead-row" key={b.name}>
            <i style={{ background: b.color }} />
            <span>{b.name}</span>
            <em className="bead-count">×{b.count}</em>
          </div>
        ))}
      </section>

      <SectionTitle tone="mint" label="最近修改" />
      <section className="history-list">
        {history.map((h) => (
          <div className="history-row" key={h.time}>
            <span className="history-dot" />
            <div>
              <small>{h.time}</small>
              <strong>{h.label}</strong>
            </div>
          </div>
        ))}
      </section>

      <BottomActionBar
        secondary={{ label: '编辑', icon: <Pencil size={18} /> }}
        primary={{ label: '保存图片', icon: <Download size={18} /> }}
      />
    </div>
  );
}
