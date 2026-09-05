function StatCard({ title, value, description, icon }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-3xl font-extrabold text-slate-900">{value}</div>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  );
}

export default StatCard;
