const ROWS = [
  { key: "topicRelevance", label: "Topic relevance", weight: "0.40" },
  { key: "userInterest", label: "Content similarity to your reads", weight: "0.25" },
  { key: "diversity", label: "Perspective-diversity bonus", weight: "0.15" },
  { key: "novelty", label: "Topic novelty", weight: "0.10" },
  { key: "quality", label: "Source coverage", weight: "0.10" },
];

export default function ScoreBreakdown({ breakdown, score }) {
  return (
    <div className="border border-[var(--color-rule)] rounded-sm p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm">Why this was recommended</h3>
        <span className="text-xs text-[var(--color-paper-dim,#a9a696)]">
          score {score.toFixed(3)}
        </span>
      </div>
      <div className="space-y-2.5">
        {ROWS.map((r) => {
          const v = breakdown[r.key] ?? 0;
          return (
            <div key={r.key} className="flex items-center gap-3 text-xs">
              <span className="w-44 shrink-0 text-[var(--color-paper-dim,#a9a696)]">
                {r.label} <span className="opacity-60">×{r.weight}</span>
              </span>
              <div className="flex-1 h-2 bg-[var(--color-ink-soft)] rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm bg-[var(--color-amber)]"
                  style={{ width: `${Math.min(100, v * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right tabular-nums">{v.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
