import { ChevronRight, Search } from 'lucide-react';
import PixelPreview from '../components/PixelPreview.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { mockProjects } from '../data/mockProjects.js';

export default function Projects({ goTo }) {
  return (
    <div className="page flow-page">
      <SectionTitle
        tone="clay"
        label="我的作品"
        hint={`${mockProjects.length} 个本地草稿`}
        action={
          <button className="section-toggle" type="button" aria-label="搜索">
            <Search size={12} />
            <span>搜索</span>
          </button>
        }
      />

      <section className="project-list">
        {mockProjects.map((project) => (
          <button
            className="project-row"
            key={project.id}
            type="button"
            onClick={() => goTo('detail')}
          >
            <PixelPreview cells={project.cells} compact />
            <div>
              <strong>{project.name}</strong>
              <small>
                {project.type} · {project.size} · {project.palette}
              </small>
              <span className="progress-track">
                <i style={{ width: `${project.progress}%` }} />
              </span>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>
    </div>
  );
}
