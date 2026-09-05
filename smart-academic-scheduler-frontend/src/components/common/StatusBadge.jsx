function StatusBadge({ status }) {
  const styles = {
    DRAFT: 'bg-amber-100 text-amber-800 border-amber-200',
    PUBLISHED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
    true: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    false: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
    true: 'Active',
    false: 'Inactive',
  };

  const key = String(status);
  const badgeStyle = styles[key] || 'bg-slate-100 text-slate-700 border-slate-200';
  const badgeLabel = labels[key] || key;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>
      {badgeLabel}
    </span>
  );
}

export default StatusBadge;
