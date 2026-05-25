export default function BottomActionBar({ primary, secondary }) {
  return (
    <footer className="bottom-action-bar">
      {secondary ? (
        <button className="secondary-action" type="button" onClick={secondary.onClick}>
          {secondary.icon}
          <span>{secondary.label}</span>
        </button>
      ) : null}
      <button className="primary-action" type="button" onClick={primary.onClick}>
        {primary.icon}
        <span>{primary.label}</span>
      </button>
    </footer>
  );
}
