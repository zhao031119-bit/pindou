export default function SectionTitle({ label, action }) {
  return (
    <div className="section-title">
      <strong className="section-label">{label}</strong>
      {action ? <span className="section-action">{action}</span> : null}
    </div>
  );
}
