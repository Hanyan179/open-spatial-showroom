// Visible language appears on intent; accessible names always remain available.
export default function IconControl({ label, children, className = '', ...props }) {
  return <button {...props} className={'icon-control ' + className} aria-label={label}>
    {children}<span className="control-tooltip" role="tooltip">{label}</span>
  </button>;
}
