import { Check } from 'lucide-react';

export default function StepIndicator({ steps, current }) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <nav className="step-indicator" aria-label="流程进度">
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'todo';
        return (
          <div className={`step-node step-${state}`} key={step.id}>
            <span className="step-dot">
              {state === 'done' ? <Check size={12} strokeWidth={3} /> : <i />}
            </span>
            <span className="step-label">{step.label}</span>
            {index < steps.length - 1 ? <span className="step-line" /> : null}
          </div>
        );
      })}
    </nav>
  );
}
