import { useState } from 'react';
import { ChevronRight, Plus, Search } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { mockProjects } from '../data/mockProjects.js';

export default function Projects({ goTo }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const projects = showEmpty ? [] : mockProjects;

  return (
    <div className="page flow-page">
      <SectionTitle
        label="我的作品"
        action={<span>{projects.length ? `${projects.length} 个` : '空'}</span>}
      />

      {projects.length === 0 ? (
        <EmptyState
          illustration="box"
          title="作品空空的"
          hint="开始一次创作，作品会自动保存在这里"
          action={
            <button className="empty-cta" type="button" onClick={() => goTo('upload')}>
              <Plus size={16} />
              <span>开始创作</span>
            </button>
          }
        />
      ) : (
        <section className="project-list stagger-in">
          {projects.map((project, index) => (
            <button
              className="project-row"
              key={project.id}
              type="button"
              onClick={() => goTo('detail')}
              style={{ animationDelay: `${index * 60}ms` }}
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
      )}

      <button
        type="button"
        className={showEmpty ? 'dev-chip active' : 'dev-chip'}
        onClick={() => setShowEmpty((v) => !v)}
      >
        <Search size={11} />
        <span>{showEmpty ? '空状态' : '空态'}</span>
      </button>
    </div>
  );
}
