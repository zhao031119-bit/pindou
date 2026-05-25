import { ArrowLeft, MoreHorizontal } from 'lucide-react';

export default function AppHeader({ page, onHome }) {
  const isHome = page.id === 'home';

  return (
    <header className={`app-header tone-${page.tone || 'clay'}`}>
      <button
        className="header-leading"
        type="button"
        aria-label={isHome ? '更多' : '返回'}
        onClick={isHome ? undefined : onHome}
      >
        {isHome ? <MoreHorizontal size={18} strokeWidth={2.4} /> : <ArrowLeft size={18} strokeWidth={2.4} />}
      </button>

      <div className="header-identity">
        <span className="header-eyebrow" aria-hidden="true">
          <i className="header-tone-dot" />
          <em>{page.label}</em>
          <span className="header-glyph">{page.glyph}</span>
        </span>
        <strong className="header-title-text">{page.title}</strong>
      </div>

      <div className="header-trailing">
        <span className="header-page-no" aria-hidden="true">{page.miniapp.split('/')[1] || page.id}</span>
      </div>
    </header>
  );
}
