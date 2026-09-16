import { buildFeed } from "../lib/recommender";
import ArticleCard from "./ArticleCard";

export default function Feed({ history, onOpen }) {
  const groups = buildFeed(history, "prism");

  if (groups.length === 0) {
    return (
      <p className="text-sm text-[var(--color-paper-dim,#a9a696)]">
        You've read everything in the demo set — nice work.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.topicId}>
          <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[var(--color-rule)]">
            <h2 className="font-display text-2xl">{g.topicLabel}</h2>
            <span className="text-xs text-[var(--color-paper-dim,#a9a696)]">
              best match {g.bestScore.toFixed(2)}
            </span>
          </div>
          <div className="space-y-4">
            <ArticleCard
              article={g.recommended.article}
              score={g.recommended.score}
              tag="Recommended for you"
              onOpen={onOpen}
            />
            {g.alternate && (
              <ArticleCard
                article={g.alternate.article}
                score={g.alternate.score}
                tag="Different perspective, same topic"
                onOpen={onOpen}
              />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
