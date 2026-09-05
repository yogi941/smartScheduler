function Alert({ children, tone = 'info', className = '' }) {
  if (!children) return null;

  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className={`rounded-xl border p-4 text-sm font-medium ${styles[tone]} ${className}`}>
      {children}
    </div>
  );
}

export default Alert;
