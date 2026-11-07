export default function EmptyState({ title, children, loading = false, icon: Icon }) {
  return (
    <div className="empty-state" role={loading ? 'status' : undefined}>
      {loading ? <span className="spinner" /> : Icon && <Icon size={30} strokeWidth={1.4} />}
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
