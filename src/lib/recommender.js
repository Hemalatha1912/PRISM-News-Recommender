import articles from "../data/articles.json";
import similarity from "../data/similarity.json";
import topics from "../data/topics.json";

const idToIdx = new Map(similarity.ids.map((id, i) => [id, i]));
const idToArticle = new Map(articles.map((a) => [a.id, a]));
const MAX_SOURCE_COUNT = Math.max(...articles.map((a) => a.topicSourceCount));
const NUM_TOPICS = topics.length;

export function simOf(idA, idB) {
  const i = idToIdx.get(idA);
  const j = idToIdx.get(idB);
  if (i === undefined || j === undefined) return 0;
  return similarity.matrix[i][j];
}

export function bucketOf(bias) {
  if (bias < 35) return "left";
  if (bias > 65) return "right";
  return "center";
}

export function labelOf(bias) {
  const b = bucketOf(bias);
  if (b === "left") return "Left-leaning";
  if (b === "right") return "Right-leaning";
  return "Center";
}

// Normalized entropy across left/center/right, 0 (all one bucket) to 1 (even split)
export function diversityIndex(buckets) {
  if (buckets.length === 0) return 0;
  const counts = { left: 0, center: 0, right: 0 };
  buckets.forEach((b) => counts[b]++);
  const n = buckets.length;
  const shares = Object.values(counts)
    .map((c) => c / n)
    .filter((p) => p > 0);
  const entropy = shares.reduce((acc, p) => acc - p * Math.log2(p), 0);
  return Math.round((entropy / Math.log2(3)) * 100) / 100;
}

export function balanceShares(buckets) {
  const counts = { left: 0, center: 0, right: 0 };
  buckets.forEach((b) => counts[b]++);
  const n = buckets.length || 1;
  return {
    left: Math.round((counts.left / n) * 100),
    center: Math.round((counts.center / n) * 100),
    right: Math.round((counts.right / n) * 100),
  };
}

// Build read-history-derived signals used by the scorer.
function buildHistorySignals(history) {
  const readIds = history.map((h) => h.id);
  const readTopicCount = {};
  const bucketCount = { left: 0, center: 0, right: 0 };
  history.forEach((h) => {
    const a = idToArticle.get(h.id);
    if (!a) return;
    readTopicCount[a.topic] = (readTopicCount[a.topic] || 0) + 1;
    bucketCount[bucketOf(a.bias)]++;
  });
  return { readIds, readTopicCount, bucketCount, n: Math.max(1, readIds.length) };
}

// Score a single candidate article against the user's history.
// mode: "prism" (relevance + interest + diversity + novelty + quality)
//    or "traditional" (relevance + interest + bucket-affinity reinforcement)
export function scoreCandidate(candidate, history, mode = "prism") {
  const { readIds, readTopicCount, bucketCount, n } = buildHistorySignals(history);
  const totalReads = readIds.length;

  const topicRelevance =
    ((readTopicCount[candidate.topic] || 0) + 1) / (totalReads + NUM_TOPICS);

  const userInterest =
    readIds.length > 0
      ? readIds.reduce((sum, rid) => sum + simOf(candidate.id, rid), 0) / readIds.length
      : 0;

  if (mode === "traditional") {
    const bucketAffinity = bucketCount[bucketOf(candidate.bias)] / n;
    const score = 0.4 * topicRelevance + 0.3 * userInterest + 0.3 * bucketAffinity;
    return { score, breakdown: { topicRelevance, userInterest, diversity: 0, novelty: 0, quality: 0 } };
  }

  const target = 1 / 3;
  const share = bucketCount[bucketOf(candidate.bias)] / n;
  const diversity = Math.max(0, (target - share) / target);
  const novelty = 1 - (readTopicCount[candidate.topic] || 0) / totalReads || 1;
  const noveltyClamped = totalReads === 0 ? 1 : 1 - (readTopicCount[candidate.topic] || 0) / totalReads;
  const quality = candidate.topicSourceCount / MAX_SOURCE_COUNT;

  const score =
    0.4 * topicRelevance + 0.25 * userInterest + 0.15 * diversity + 0.1 * noveltyClamped + 0.1 * quality;

  return {
    score,
    breakdown: { topicRelevance, userInterest, diversity, novelty: noveltyClamped, quality },
  };
}

// Build the personalized feed: rank topics by best available score, and within
// each topic surface the top pick plus the best different-perspective pick.
export function buildFeed(history, mode = "prism") {
  const readSet = new Set(history.map((h) => h.id));
  const candidates = articles.filter((a) => !readSet.has(a.id));

  const scored = candidates.map((a) => ({ article: a, ...scoreCandidate(a, history, mode) }));
  scored.sort((a, b) => b.score - a.score);

  const byTopic = new Map();
  scored.forEach((s) => {
    const key = s.article.topic;
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key).push(s);
  });

  const groups = [];
  for (const [topicId, list] of byTopic.entries()) {
    const top = list[0];
    const topBucket = bucketOf(top.article.bias);
    const different = list.find((s) => bucketOf(s.article.bias) !== topBucket);
    const topicMeta = topics.find((t) => t.id === topicId);
    groups.push({
      topicId,
      topicLabel: topicMeta ? topicMeta.label : topicId,
      bestScore: top.score,
      recommended: top,
      alternate: different || null,
    });
  }

  groups.sort((a, b) => b.bestScore - a.bestScore);
  return groups;
}

export function getArticle(id) {
  return idToArticle.get(id);
}

export function allArticles() {
  return articles;
}

export function allTopics() {
  return topics;
}

export function similarArticles(id, excludeIds = [], limit = 3) {
  const idx = idToIdx.get(id);
  if (idx === undefined) return [];
  const exclude = new Set([id, ...excludeIds]);
  return similarity.ids
    .map((otherId, i) => ({ id: otherId, sim: similarity.matrix[idx][i] }))
    .filter((x) => !exclude.has(x.id))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, limit)
    .map((x) => ({ ...idToArticle.get(x.id), similarity: x.sim }));
}
