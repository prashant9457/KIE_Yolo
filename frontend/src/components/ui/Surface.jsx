export default function Surface({ children, className = '', as: Element = 'section', ...props }) {
  return (
    <Element className={`surface-shell ${className}`} {...props}>
      <div className="surface-core">{children}</div>
    </Element>
  );
}
