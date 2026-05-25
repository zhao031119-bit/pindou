const LOADING_GRID = Array.from({ length: 16 });

export default function LoadingPixels({ label = '识别中', hint = '正在分析像素颜色…' }) {
  return (
    <div className="loading-pixels" role="status" aria-live="polite">
      <div className="loading-grid" aria-hidden="true">
        {LOADING_GRID.map((_, index) => (
          <i key={index} style={{ animationDelay: `${(index % 8) * 80}ms` }} />
        ))}
      </div>
      <strong>{label}</strong>
      <small>{hint}</small>
    </div>
  );
}
