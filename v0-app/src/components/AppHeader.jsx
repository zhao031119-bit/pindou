import { ArrowLeft, Home, MoreHorizontal } from 'lucide-react';

export default function AppHeader({ page, onHome }) {
  return (
    <header className="app-header">
      <div className="header-side">
        {page.id === 'home' ? (
          <button className="icon-button" type="button" aria-label="更多">
            <MoreHorizontal size={20} />
          </button>
        ) : (
          <button className="icon-button" type="button" aria-label="返回">
            <ArrowLeft size={20} />
          </button>
        )}
      </div>
      <div className="header-title">
        <strong>{page.title}</strong>
        <span>{page.subtitle}</span>
      </div>
      <div className="header-side right">
        <button className="icon-button" type="button" aria-label="回到首页" onClick={onHome}>
          <Home size={19} />
        </button>
      </div>
    </header>
  );
}
