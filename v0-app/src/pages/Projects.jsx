import { ChevronRight } from 'lucide-react';
import PixelPreview from '../components/PixelPreview.jsx';
import { mockProjects } from '../data/mockProjects.js';

export default function Projects({ goTo }) {
  return (
    <div className="page flow-page">
      <section className="project-list">
        {mockProjects.map((project) => (
          <button className="project-row" key={project.id} type="button" onClick={() => goTo('detail')}>
            <PixelPreview cells={project.cells} compact />
            <div>
              <strong>{project.name}</strong>
              <small>
                {project.type} · {project.size} · {project.palette}
              </small>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>
    </div>
  );
}
