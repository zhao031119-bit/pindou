// 4x4 pixel illustration; 1 = on, 0 = off
const ILLUSTRATIONS = {
  // open box
  box: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0]
  ],
  // pixel heart
  heart: [
    [0, 1, 0, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0],
    [0, 0, 1, 0]
  ],
  // magnifier
  search: [
    [1, 1, 1, 0],
    [1, 0, 1, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 1]
  ]
};

export default function EmptyState({
  illustration = 'box',
  title = '还没有内容',
  hint = '完成一次创作后会显示在这里',
  action
}) {
  const matrix = ILLUSTRATIONS[illustration] || ILLUSTRATIONS.box;
  return (
    <div className="empty-state" role="status">
      <div className="empty-illust" aria-hidden="true">
        {matrix.flat().map((cell, index) => (
          <i key={index} className={cell ? 'on' : 'off'} />
        ))}
      </div>
      <strong>{title}</strong>
      <small>{hint}</small>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
