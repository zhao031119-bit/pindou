import { useEffect, useState } from 'react';

export default function DevModeToggle({ label = '切换状态', onToggle, active }) {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    setPressed(!!active);
  }, [active]);

  return (
    <button
      type="button"
      className={pressed ? 'dev-chip active' : 'dev-chip'}
      onClick={() => {
        setPressed((v) => !v);
        if (onToggle) onToggle(!pressed);
      }}
      aria-pressed={pressed}
      aria-label={label}
    >
      <span className="dev-chip-dot" />
      <span>{label}</span>
    </button>
  );
}
