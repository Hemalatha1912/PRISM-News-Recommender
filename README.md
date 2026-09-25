# PRISM — A diversity-aware news recommender

A React recommender system that ranks real news articles for
relevance while explicitly countering echo-chamber reinforcement. No backend,
no invented data: real articles, real AllSides bias labels, a real TF-IDF
similarity model, and a real simulated evaluation.

## Run it

```
npm install
npm run dev
```

## What makes this a recommender system (not a rule-based feed)

- **Dynamic weighted scoring**, not a fixed 70/20/10 mix:
  `score = 0.40·topic relevance + 0.25·content similarity + 0.15·diversity bonus + 0.10·novelty + 0.10·source coverage`
- **Content-based similarity**: TF-IDF vectors over real article text, cosine
  similarity computed offline, shipped as a precomputed matrix.
- **Topic-aware diversity**: alternative perspectives are always about the
  *same* topic, never a random different one.
- **Explainability**: every recommended card can show its full score
  breakdown, and topic-level "distinctive language" panels are computed from
  real TF-IDF term-frequency differences — not invented debate text.
- **A real offline evaluation** (`/evaluation`) comparing a Traditional
  (relevance + bucket-reinforcement) baseline against PRISM (relevance +
  explicit diversity bonus) over simulated reading sessions. Numbers are
  computed by `eval.py`, not hand-picked.

## Data pipeline (already run, outputs committed under `src/data/`)

1. `Article-Bias-Prediction` dataset cloned from
   https://github.com/ramybaly/Article-Bias-Prediction (Baly et al., EMNLP
   2020) — 37,554 articles, each with a real AllSides left/center/right
   rating.
2. `curate.py` samples 14 topics with genuine balanced left/center/right
   coverage (≥3 articles per bucket in the full dataset), takes up to 5
   articles per bucket per topic (210 articles total), computes TF-IDF
   vectors + a full pairwise similarity matrix, and extracts per-topic
   distinguishing keywords per bias bucket.
3. `eval.py` runs the traditional-vs-PRISM simulation and writes
   `evaluation.json`.


