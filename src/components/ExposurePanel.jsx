import { diversityIndex, balanceShares } from "../lib/recommender";

export default function ExposurePanel({ history }) {
  const buckets = history.map((h) => h.bucket);
  const shares = balanceShares(buckets);
  const diversity = diversityIndex(buckets);

  const rows = [
    { label: "Left-leaning", value: shares.left, color: "var(--color-spec-left)" },
    { label: "Center", value: shares.center, color: "var(--color-spec-center)" },
    { label: "Right-leaning", value: shares.right, color: "var(--color-spec-right)" },
  ];

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start border border-[var(--color-rule)] rounded-sm p-5 bg-[var(--color-ink-soft)]/40">
      <h2 className="font-display text-xl mb-1">Your reading exposure</h2>
      <p className="text-xs text-[var(--color-paper-dim,#a9a696)] mb-4 leading-relaxed">
        The distribution of perspective labels among articles you've opened this
        session — not an estimate of your political identity.
      </p>

      <div className="space-y-2.5 mb-5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-[var(--color-paper-dim,#a9a696)]">
              {r.label}
            </span>
            <div className="flex-1 h-2.5 bg-[var(--color-ink-soft)] rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-500"
                style={{ width: `${r.value}%`, background: r.color }}
              />
            </div>
            <span className="w-9 text-right tabular-nums">{r.value}%</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-[var(--color-rule)] mb-4" />

      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm">Diversity index</span>
        <span className="font-display text-2xl tabular-nums">{diversity.toFixed(2)}</span>
      </div>
      <p className="text-xs text-[var(--color-paper-dim,#a9a696)] leading-relaxed">
        Normalized entropy across left / center / right shares.{" "}
        <span className="italic">0 = everything from one bucket, 1 = an even split.</span>
      </p>

      {history.length === 0 && (
        <p className="text-xs text-[var(--color-amber)] mt-4">
          Open an article to start building your profile.
        </p>
      )}
    </aside>
  );
}
