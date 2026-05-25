import { ChevronRight } from 'lucide-react';
import PixelCard from '../components/PixelCard.jsx';
import PixelPreview from '../components/PixelPreview.jsx';
import { homeCards } from '../data/pages.js';
import { mockProjects } from '../data/mockProjects.js';

export default function Home({ goTo }) {
  const latest = mockProjects[0];

  return (
    <div className="page page-home">
      <section className="home-hero">
        <span>下午好，小南瓜</span>
        <h1>
          今天想<span>拼点</span>什么呢?
        </h1>
      </section>

      <section className="bento-grid" aria-label="功能入口">
        {homeCards.map((card) => (
          <PixelCard key={card.id} card={card} onClick={() => goTo(card.id)} />
        ))}
      </section>

      <button className="draft-card" type="button" onClick={() => goTo('detail')}>
        <PixelPreview cells={latest.cells} compact />
        <span className="draft-meta">
          <small>继续草稿</small>
          <strong>{latest.name}</strong>
          <span className="progress-track">
            <i style={{ width: `${latest.progress}%` }} />
          </span>
        </span>
        <ChevronRight size={19} />
      </button>

      <button className="works-strip" type="button" onClick={() => goTo('projects')}>
        <span>
          <strong>我的作品</strong>
          <small>{mockProjects.length} 个本地作品</small>
        </span>
        <div className="thumb-stack">
          {mockProjects.map((project) => (
            <PixelPreview key={project.id} cells={project.cells} compact />
          ))}
        </div>
      </button>
    </div>
  );
}
