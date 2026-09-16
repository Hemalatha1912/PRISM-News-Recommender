import { getArticle, bucketOf, scoreCandidate, similarArticles, allArticles } from "../lib/recommender";
import ScoreBreakdown from "./ScoreBreakdown";
import PerspectiveLanguage from "./PerspectiveLanguage";

const bucketLabel = { left: "Left-leaning", center: "Center", right: "Right-leaning" };

export default function ArticleDetail({ articleId, history, onBack, onOpen }) {
  const article = getArticle(articleId);
  if (!article) return null;

  const priorHistory = history.filter((h) => h.id !== articleId);
  const { score, breakdown } = scoreCandidate(article, priorHistory, "prism");

  const sameTopic = allArticles().filter((a) => a.topic === article.topic && a.id !== article.id);
  const bucket = bucketOf(article.bias);
  const alternate = sameTopic
    .filter((a) => bucketOf(a.bias) !== bucket)
    .sort((a, b) => a.topicSourceCount - b.topicSourceCount)[0];

  const readIds = history.map((h) => h.id);
  const similar = similarArticles(article.id, readIds, 3);

  return (
    <div className="max-w-3xl">
      <button
        onClick={onBack}
        className="text-sm text-[var(--color-paper-dim,#a9a696)] hover:text-[var(--color-paper)] mb-6"
      >
        ← Back to feed
      </button>

      <div className="text-xs text-[var(--color-paper-dim,#a9a696)] mb-3 flex items-center gap-2 flex-wrap">
        <span>{article.source}</span>
        <span aria-hidden="true">·</span>
        <span>{bucketLabel[bucket]} (AllSides rating)</span>
        <span aria-hidden="true">·</span>
        <span>{article.date}</span>
        <span aria-hidden="true">·</span>
        <span>{article.topicLabel}</span>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl leading-tight mb-5">{article.title}</h1>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm px-4 py-2 border border-[var(--color-rule)] rounded-sm hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] transition-colors mb-8"
      >
        Read the full article at {article.source} ↗
      </a>

      <div className="mb-6">
        <ScoreBreakdown breakdown={breakdown} score={score} />
      </div>

      {alternate && (
        <div className="border border-[var(--color-rule)] rounded-sm p-5 mb-6">
          <p className="text-xs text-[var(--color-paper-dim,#a9a696)] mb-2">
            Same topic, different perspective
          </p>
          <button onClick={() => onOpen(alternate.id)} className="text-left w-full group">
            <div className="flex items-center gap-2 text-xs text-[var(--color-paper-dim,#a9a696)] mb-1">
              <span>{alternate.source}</span>
              <span aria-hidden="true">·</span>
              <span>{bucketLabel[bucketOf(alternate.bias)]}</span>
            </div>
            <h3 className="font-display text-lg group-hover:underline decoration-[var(--color-rule)]">
              {alternate.title}
            </h3>
          </button>
        </div>
      )}

      <div className="mb-6">
        <PerspectiveLanguage topicId={article.topic} />
      </div>

      {similar.length > 0 && (
        <div className="border border-[var(--color-rule)] rounded-sm p-5">
          <p className="text-xs text-[var(--color-paper-dim,#a9a696)] mb-3">
            Most similar articles by content (cosine similarity on TF-IDF vectors)
          </p>
          <div className="space-y-3">
            {similar.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpen(s.id)}
                className="text-left w-full group flex items-baseline justify-between gap-3"
              >
                <span className="text-sm group-hover:underline decoration-[var(--color-rule)]">
                  {s.title}
                </span>
                <span className="text-xs text-[var(--color-paper-dim,#a9a696)] shrink-0">
                  {s.similarity.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
