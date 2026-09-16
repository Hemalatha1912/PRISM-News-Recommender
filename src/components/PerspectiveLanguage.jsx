import keywords from "../data/keywords.json";

export default function PerspectiveLanguage({ topicId }) {
  const entry = keywords[topicId];
  if (!entry || (entry.left.length === 0 && entry.right.length === 0)) return null;

  return (
    <div className="border border-[var(--color-rule)] rounded-sm p-5 bg-[var(--color-ink-soft)]/40">
      <h3 className="text-sm mb-1">Distinctive language by perspective</h3>
      <p className="text-xs text-[var(--color-paper-dim,#a9a696)] mb-4 leading-relaxed">
        Computed from term-frequency differences (TF-IDF) between this topic's
        left- and right-labeled articles in the dataset — the words each side's
        coverage disproportionately uses, not a summary of anyone's opinion.
      </p>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="text-xs mb-2" style={{ color: "var(--color-spec-left)" }}>
            Left-labeled coverage emphasizes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {entry.left.map((w) => (
              <span
                key={w}
                className="text-xs px-2 py-1 rounded-sm border"
                style={{ borderColor: "var(--color-spec-left-dim)" }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs mb-2" style={{ color: "var(--color-spec-right)" }}>
            Right-labeled coverage emphasizes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {entry.right.map((w) => (
              <span
                key={w}
                className="text-xs px-2 py-1 rounded-sm border"
                style={{ borderColor: "var(--color-spec-right-dim)" }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
