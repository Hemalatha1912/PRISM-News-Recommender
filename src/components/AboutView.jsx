export default function AboutView() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-3xl mb-2">How PRISM ranks articles</h1>
        <p className="text-sm text-[var(--color-paper-dim,#a9a696)] leading-relaxed">
          PRISM is a perspective-diversity-aware recommender: it optimizes for
          relevance to your reading history the way a normal content
          recommender would, while adding an explicit term that counteracts
          echo-chamber reinforcement.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">Scoring formula</h2>
        <pre className="text-xs sm:text-sm border border-[var(--color-rule)] rounded-sm p-4 overflow-x-auto bg-[var(--color-ink-soft)]/40 leading-relaxed">
{`score = 0.40 × topic relevance
      + 0.25 × content similarity to your reads
      + 0.15 × perspective-diversity bonus
      + 0.10 × topic novelty
      + 0.10 × source coverage`}
        </pre>
        <ul className="mt-4 space-y-2 text-sm text-[var(--color-paper-dim,#a9a696)] leading-relaxed">
          <li><strong className="text-[var(--color-paper)]">Topic relevance</strong> — Laplace-smoothed share of your reads that fall in this article's topic, so cold starts default to a uniform prior instead of zero.</li>
          <li><strong className="text-[var(--color-paper)]">Content similarity</strong> — mean cosine similarity, over TF-IDF vectors, between the candidate and every article you've already opened.</li>
          <li><strong className="text-[var(--color-paper)]">Diversity bonus</strong> — rises the further your current left/center/right split sits below an even 1/3 share for this article's bucket. Reading more from one side raises the bonus for the others.</li>
          <li><strong className="text-[var(--color-paper)]">Topic novelty</strong> — higher for topics you haven't read yet, so the feed doesn't just deepen one subject forever.</li>
          <li><strong className="text-[var(--color-paper)]">Source coverage</strong> — how many distinct outlets in the dataset cover this topic, a rough proxy for how significant the story is.</li>
        </ul>
        <p className="mt-4 text-sm text-[var(--color-paper-dim,#a9a696)] leading-relaxed">
          The feed groups candidates by topic, ranks topics by their best
          score, and within each topic surfaces the top pick plus the
          highest-scoring pick from a <em>different</em> perspective bucket —
          so the alternative view is always about the same story, never a
          random different topic.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">What "perspective" means here</h2>
        <p className="text-sm text-[var(--color-paper-dim,#a9a696)] leading-relaxed">
          Every article's left / center / right label comes from{" "}
          <a
            href="https://www.allsides.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--color-rule)] hover:text-[var(--color-paper)]"
          >
            AllSides
          </a>
          , a media-rating organization that scores individual articles
          through blind surveys, editorial review, and independent analysis —
          not a label this system invented. PRISM's own contribution is the
          ranking and diversity logic layered on top, plus the data-driven
          "distinctive language" panel, which is computed directly from
          term-frequency differences between labeled articles rather than any
          generated summary of a side's beliefs.
        </p>
        <p className="mt-3 text-sm text-[var(--color-paper-dim,#a9a696)] leading-relaxed">
          Your own "reading exposure" profile measures the distribution of
          labels among what you've opened this session — it is not, and isn't
          presented as, an estimate of your political identity.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">Dataset</h2>
        <p className="text-sm text-[var(--color-paper-dim,#a9a696)] leading-relaxed">
          210 articles curated from{" "}
          <a
            href="https://github.com/ramybaly/Article-Bias-Prediction"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--color-rule)] hover:text-[var(--color-paper)]"
          >
            Article-Bias-Prediction
          </a>{" "}
          (Baly et al., "We Can Detect Your Bias: Predicting the Political
          Ideology of News Articles," EMNLP 2020) — 37,554 AllSides-rated
          articles across 73 outlets and 109 topics. This demo samples 14
          topics with real, balanced left/center/right coverage and up to
          five articles per bucket per topic. Article bodies aren't
          reproduced in this app; each card links to the original source.
        </p>
      </div>

      <div>
        <h2 className="font-display text-xl mb-3">Architecture</h2>
        <pre className="text-xs border border-[var(--color-rule)] rounded-sm p-4 overflow-x-auto bg-[var(--color-ink-soft)]/40 leading-relaxed">
{`Curated articles (real AllSides labels)
        │
        ├── TF-IDF vectorization ──► pairwise similarity matrix
        │                                   │
        ├── per-topic keyword extraction     │
        │   (left vs. right term frequency)  │
        │                                   ▼
        │                          content similarity term
        ▼
Reading history (this session)
        │
        ├── topic relevance
        ├── bucket distribution ──► diversity bonus
        └── topics seen ──► novelty
                    │
                    ▼
        Weighted ranking → per-topic groups →
        "recommended" + "different perspective" pair
                    │
                    ▼
        Rendered feed + explanation panel`}
        </pre>
        <p className="mt-4 text-xs text-[var(--color-paper-dim,#a9a696)]">
          Everything above runs client-side. The TF-IDF vectors, similarity
          matrix, and keyword lists were precomputed once in Python; no
          backend is needed to serve this curated demo.
        </p>
      </div>
    </div>
  );
}
