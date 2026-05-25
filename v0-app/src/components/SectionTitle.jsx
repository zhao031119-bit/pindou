export default function SectionTitle({ tone = 'clay', label, hint, action }) {
  return (
    <div className="section-title">
      <span className={`section-pixel tone-${tone}`} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <div className="section-copy">
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
      {action ? <span className="section-action">{action}</span> : null}
    </div>
  );
}
