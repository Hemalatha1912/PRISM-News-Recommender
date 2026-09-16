import json, math, random
import numpy as np

DATA_DIR = "/home/claude/prism/src/data"
random.seed(42)

with open(f"{DATA_DIR}/articles.json") as f:
    articles = json.load(f)
with open(f"{DATA_DIR}/similarity.json") as f:
    sim_data = json.load(f)

id_to_idx = {aid: i for i, aid in enumerate(sim_data["ids"])}
sim_matrix = np.array(sim_data["matrix"])
topics = sorted({a["topic"] for a in articles})
max_source_count = max(a["topicSourceCount"] for a in articles)

def bucket_of(bias):
    if bias < 35: return "left"
    if bias > 65: return "right"
    return "center"

def entropy_diversity(buckets):
    if not buckets:
        return 0.0
    counts = {"left": 0, "center": 0, "right": 0}
    for b in buckets:
        counts[b] += 1
    n = len(buckets)
    shares = [c / n for c in counts.values() if c > 0]
    h = -sum(p * math.log2(p) for p in shares)
    return round(h / math.log2(3), 3)

def sim(id_a, id_b):
    return sim_matrix[id_to_idx[id_a]][id_to_idx[id_b]]

def score_candidate(cand, read_ids, read_topics_count, total_reads, mode):
    # topic relevance: laplace-smoothed interest in this topic from history
    topic_relevance = (read_topics_count.get(cand["topic"], 0) + 1) / (total_reads + len(topics))
    # user interest: content similarity to read history (cold start -> 0)
    user_interest = (
        sum(sim(cand["id"], rid) for rid in read_ids) / len(read_ids) if read_ids else 0.0
    )

    bucket_counts = {"left": 0, "center": 0, "right": 0}
    for rid in read_ids:
        a = articles[id_to_idx[rid]]
        bucket_counts[bucket_of(a["bias"])] += 1
    n = max(1, len(read_ids))

    if mode == "traditional":
        # the actual echo-chamber mechanic: engagement-based systems reinforce
        # whatever bias bucket you've already clicked, since that correlates
        # with the sources/framing you've historically engaged with.
        bucket_affinity = bucket_counts[bucket_of(cand["bias"])] / n
        score = 0.40 * topic_relevance + 0.30 * user_interest + 0.30 * bucket_affinity
        return score, {
            "topicRelevance": topic_relevance, "userInterest": user_interest,
            "diversity": 0, "novelty": 0, "quality": 0,
        }

    # diversity bonus: reward buckets under-represented vs. an even 1/3 split
    target = 1 / 3
    share = bucket_counts[bucket_of(cand["bias"])] / n
    diversity_bonus = max(0.0, (target - share) / target)

    novelty = 1 - (read_topics_count.get(cand["topic"], 0) / max(1, total_reads))
    quality = cand["topicSourceCount"] / max_source_count

    score = (
        0.40 * topic_relevance
        + 0.25 * user_interest
        + 0.15 * diversity_bonus
        + 0.10 * novelty
        + 0.10 * quality
    )
    return score, {
        "topicRelevance": topic_relevance, "userInterest": user_interest,
        "diversity": diversity_bonus, "novelty": novelty, "quality": quality,
    }

def run_session(mode, n_steps=30, seed_bias="left"):
    # seed with 3 initial reads from one bucket, simulating an existing bubble
    seed_pool = [a for a in articles if bucket_of(a["bias"]) == seed_bias]
    random.shuffle(seed_pool)
    read_ids = [a["id"] for a in seed_pool[:3]]
    read_topics_count = {}
    for rid in read_ids:
        t = articles[id_to_idx[rid]]["topic"]
        read_topics_count[t] = read_topics_count.get(t, 0) + 1

    diversity_series = [entropy_diversity([bucket_of(articles[id_to_idx[r]]["bias"]) for r in read_ids])]
    alt_clicks = 0
    relevance_series = []

    for step in range(n_steps):
        candidates = [a for a in articles if a["id"] not in read_ids]
        scored = [(score_candidate(c, read_ids, read_topics_count, len(read_ids), mode), c) for c in candidates]
        scored.sort(key=lambda x: x[0][0], reverse=True)
        (best_score, best_breakdown), best = scored[0]

        last_bucket = bucket_of(articles[id_to_idx[read_ids[-1]]]["bias"])
        if bucket_of(best["bias"]) != last_bucket:
            alt_clicks += 1

        read_ids.append(best["id"])
        read_topics_count[best["topic"]] = read_topics_count.get(best["topic"], 0) + 1
        relevance_series.append(best_breakdown["topicRelevance"])
        diversity_series.append(
            entropy_diversity([bucket_of(articles[id_to_idx[r]]["bias"]) for r in read_ids])
        )

    return {
        "diversitySeries": diversity_series,
        "finalDiversity": diversity_series[-1],
        "avgTopicRelevance": round(sum(relevance_series) / len(relevance_series), 3),
        "altPerspectiveClickRate": round(alt_clicks / n_steps, 3),
        "distinctTopicsExplored": len(read_topics_count),
    }

results = {}
for mode in ("traditional", "prism"):
    # average over a few seeded runs for stability
    runs = [run_session(mode, seed_bias=b) for b in ("left", "left", "right", "right")]
    results[mode] = {
        "diversitySeries": [
            round(sum(r["diversitySeries"][i] for r in runs) / len(runs), 3)
            for i in range(len(runs[0]["diversitySeries"]))
        ],
        "finalDiversity": round(sum(r["finalDiversity"] for r in runs) / len(runs), 3),
        "avgTopicRelevance": round(sum(r["avgTopicRelevance"] for r in runs) / len(runs), 3),
        "altPerspectiveClickRate": round(sum(r["altPerspectiveClickRate"] for r in runs) / len(runs), 3),
        "distinctTopicsExplored": round(sum(r["distinctTopicsExplored"] for r in runs) / len(runs), 1),
    }

print(json.dumps(results, indent=2))

with open(f"{DATA_DIR}/evaluation.json", "w") as f:
    json.dump(results, f)
