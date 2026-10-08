/** Shimmer skeleton for a property card while listings load. */
export default function Skeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white shadow-lg overflow-hidden animate-pulse">
          <div className="h-52 bg-slate-200" />
          <div className="p-6 space-y-3">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-7 w-1/3 rounded bg-slate-200" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-slate-200" />
              <div className="h-6 w-16 rounded-full bg-slate-200" />
              <div className="h-6 w-16 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
