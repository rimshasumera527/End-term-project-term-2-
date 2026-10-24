export function Stars({ value = 0, className = '' }) {
  return (
    <span className={`text-amber-500 ${className}`} aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(Math.round(value))}
      <span className="text-slate-300">{'★'.repeat(5 - Math.round(value))}</span>
    </span>
  );
}

export function Chip({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    brand: 'bg-indigo-50 text-indigo-700',
    gold: 'bg-gold-soft text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-600',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

export function StatusChip({ status }) {
  const map = { booked: 'brand', completed: 'green', cancelled: 'slate', 'no-show': 'red' };
  return <Chip tone={map[status] || 'slate'}>{status}</Chip>;
}
