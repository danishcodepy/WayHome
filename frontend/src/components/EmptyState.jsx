import { Link } from 'react-router-dom';

/** Friendly empty state: icon, title, subtitle and an optional action. */
export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, actionTo, onAction }) {
  const actionCls =
    'inline-block mt-5 bg-brand hover:bg-blue-600 text-white text-sm font-semibold rounded-xl px-6 py-2.5 transition-colors cursor-pointer';
  return (
    <div className="text-center bg-slate-50 border border-slate-100 rounded-3xl py-16 px-6">
      {Icon && <Icon className="w-12 h-12 mx-auto text-slate-300" />}
      <p className="text-lg font-semibold text-slate-800 mt-4">{title}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{subtitle}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className={actionCls}>
          {actionLabel}
        </button>
      )}
      {actionLabel && actionTo && !onAction && (
        <Link to={actionTo} className={actionCls}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
