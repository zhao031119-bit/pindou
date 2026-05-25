import { useMemo, useState } from 'react';
import {
  Brush,
  FolderOpen,
  ImageUp,
  LayoutGrid,
  Palette,
  Pipette,
  Ruler,
  Sparkles
} from 'lucide-react';
import AppFrame from './components/AppFrame.jsx';
import Home from './pages/Home.jsx';
import Upload from './pages/Upload.jsx';
import Size from './pages/Size.jsx';
import Result from './pages/Result.jsx';
import Pick from './pages/Pick.jsx';
import Extract from './pages/Extract.jsx';
import Draw from './pages/Draw.jsx';
import Projects from './pages/Projects.jsx';
import Detail from './pages/Detail.jsx';
import { pageRegistry } from './data/pages.js';

const pageComponents = {
  home: Home,
  upload: Upload,
  size: Size,
  result: Result,
  pick: Pick,
  extract: Extract,
  draw: Draw,
  projects: Projects,
  detail: Detail
};

const pageIcons = {
  home: LayoutGrid,
  upload: ImageUp,
  size: Ruler,
  result: Sparkles,
  pick: Pipette,
  extract: Palette,
  draw: Brush,
  projects: FolderOpen,
  detail: Sparkles
};

export default function App() {
  const [pageId, setPageId] = useState('home');
  const currentPage = useMemo(
    () => pageRegistry.find((page) => page.id === pageId) || pageRegistry[0],
    [pageId]
  );
  const CurrentPage = pageComponents[currentPage.id] || Home;

  return (
    <AppFrame
      currentPage={currentPage}
      pages={pageRegistry}
      pageIcons={pageIcons}
      onNavigate={setPageId}
    >
      <CurrentPage goTo={setPageId} />
    </AppFrame>
  );
}
