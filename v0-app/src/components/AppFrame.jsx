import AppHeader from './AppHeader.jsx';

export default function AppFrame({ children, currentPage, pages, pageIcons, onNavigate }) {
  return (
    <main className="workbench">
      <aside className="side-panel" aria-label="v0 页面导航">
        <div className="side-brand">
          <span className="brand-dot" />
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
              >
                {Icon ? <Icon size={18} strokeWidth={2.2} /> : null}
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

      <section className="phone-shell" aria-label={`${currentPage.title} 手机预览`}>
        <AppHeader page={currentPage} onHome={() => onNavigate('home')} />
        <div className="phone-body" key={currentPage.id}>{children}</div>
      </section>
    </main>
  );
}
