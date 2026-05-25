import { Download, FolderPlus } from 'lucide-react';
import BottomActionBar from '../components/BottomActionBar.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import { mockProjects } from '../data/mockProjects.js';

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

      <BottomActionBar
        secondary={{ label: '加入作品', icon: <FolderPlus size={18} /> }}
        primary={{ label: '保存图片', icon: <Download size={18} /> }}
      />
    </div>
  );
}
