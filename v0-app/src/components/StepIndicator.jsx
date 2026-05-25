export default function StepIndicator({ steps, current }) {
  const currentIndex = steps.findIndex((s) => s.id === current);
  const total = steps.length;
  const ratio = ((currentIndex + 1) / total) * 100;
  const currentStep = steps[currentIndex];

  return (
    <nav className="step-indicator" aria-label="流程进度">
      <div className="step-meta">
        <span className="step-counter">
          {String(currentIndex + 1).padStart(2, '0')}
          <em>/ {String(total).padStart(2, '0')}</em>
        </span>
        <span className="step-current">{currentStep?.label}</span>
      </div>
      <div className="step-track" role="progressbar" aria-valuenow={ratio} aria-valuemin={0} aria-valuemax={100}>
        <span className="step-fill" style={{ width: `${ratio}%` }} />
      </div>
    </nav>
  );
}
