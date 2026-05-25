import AppHeader from './AppHeader.jsx';

export default function AppFrame({ children, currentPage, pages, pageIcons, onNavigate }) {
  const tone = currentPage.tone || 'clay';

  return (
    <main className="workbench">
      <aside className="side-panel" aria-label="v0 页面导航">
        <div className="side-brand">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>拼豆星球</strong>
            <small>v0 UI Workbench</small>
          </div>
        </div>

        <nav className="page-tabs" aria-label="页面">
          {pages.map((page) => {
            const Icon = pageIcons[page.id];
            return (
              <button
                key={page.id}
                className={`page-tab ${currentPage.id === page.id ? 'active' : ''}`}
                onClick={() => onNavigate(page.id)}
                type="button"
                data-tone={page.tone || 'clay'}
              >
                <span className="page-tab-glyph" aria-hidden="true">{page.glyph}</span>
                <span>{page.label}</span>
              </button>
            );
          })}
        </nav>

        <section className="mapping-panel">
          <small>当前落地文件</small>
          <strong>{currentPage.miniapp}</strong>
        </section>
      </aside>

      <section
        className={`phone-shell tone-${tone}`}
        aria-label={`${currentPage.title} 手机预览`}
        data-page={currentPage.id}
      >
        <div className="phone-statusbar" aria-hidden="true">
          <span className="status-time">9:41</span>
          <span className="status-island" />
          <span className="status-glyphs">
            <i className="status-signal" />
            <i className="status-wifi" />
            <i className="status-battery" />
          </span>
        </div>
        <AppHeader page={currentPage} onHome={() => onNavigate('home')} />
        <div className="phone-body" key={currentPage.id}>{children}</div>
        <div className="phone-homebar" aria-hidden="true" />
      </section>
    </main>
  );
}
