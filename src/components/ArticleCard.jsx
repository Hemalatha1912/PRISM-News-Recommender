import { bucketOf } from "../lib/recommender";

const barColor = {
  left: "var(--color-spec-left)",
  center: "var(--color-spec-center)",
  right: "var(--color-spec-right)",
};
const bucketLabel = { left: "Left-leaning", center: "Center", right: "Right-leaning" };

export default function ArticleCard({ article, tag, score, onOpen }) {
  const bucket = bucketOf(article.bias);

  return (
    <button
      onClick={() => onOpen(article.id)}
      className="text-left w-full border border-[var(--color-rule)] rounded-sm p-5 hover:border-[var(--color-paper-dim,#a9a696)] transition-colors group"
      style={{ borderLeftWidth: "3px", borderLeftColor: barColor[bucket] }}
    >
      <div className="flex items-center gap-2 mb-2 text-xs text-[var(--color-paper-dim,#a9a696)] flex-wrap">
        <span>{article.source}</span>
        <span aria-hidden="true">·</span>
        <span>{bucketLabel[bucket]}</span>
        <span aria-hidden="true">·</span>
        <span>{article.date}</span>
        {tag && <span className="ml-auto text-[var(--color-amber)]">{tag}</span>}
      </div>
      <h3 className="font-display text-xl leading-snug mb-2 group-hover:underline decoration-[var(--color-rule)]">
        {article.title}
      </h3>
      <div className="flex items-center gap-3 text-xs text-[var(--color-paper-dim,#a9a696)]">
        <span>{article.topicLabel}</span>
        {typeof score === "number" && (
          <>
            <span aria-hidden="true">·</span>
            <span>match score {score.toFixed(2)}</span>
          </>
        )}
      </div>
    </button>
  );
}
