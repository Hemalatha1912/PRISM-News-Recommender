import json, os, random, re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

random.seed(7)

DATA_DIR = "/home/claude/Article-Bias-Prediction/data/jsons"
OUT_DIR = "/home/claude/prism/src/data"
os.makedirs(OUT_DIR, exist_ok=True)

with open("/home/claude/topic_index.json") as f:
    topic_index = json.load(f)

TOPICS = [
    "healthcare", "immigration", "gun_control_and_gun_rights", "environment",
    "economy_and_jobs", "education", "abortion", "taxes", "foreign_policy",
    "technology", "trade", "lgbt_rights", "national_security", "supreme_court",
]
PER_BUCKET = 5  # articles per bias per topic

TOPIC_LABELS = {
    "healthcare": "Healthcare policy",
    "immigration": "Immigration",
    "gun_control_and_gun_rights": "Gun policy",
    "environment": "Environment & climate",
    "economy_and_jobs": "Economy & jobs",
    "education": "Education policy",
    "abortion": "Abortion",
    "taxes": "Tax policy",
    "foreign_policy": "Foreign policy",
    "technology": "Technology & tech policy",
    "trade": "Trade policy",
    "lgbt_rights": "LGBT rights",
    "national_security": "National security",
    "supreme_court": "Supreme Court",
}

BIAS_NUM = {"left": 20, "center": 50, "right": 80}

# ---- 1. pick article IDs ----
chosen_ids = []
for topic in TOPICS:
    buckets = topic_index[topic]
    for bias in ("left", "center", "right"):
        ids = buckets[bias][:]
        random.shuffle(ids)
        chosen_ids += [(i, topic, bias) for i in ids[:PER_BUCKET]]

print("chosen articles:", len(chosen_ids))

# ---- 2. load full records ----
records = []
for aid, topic, bias in chosen_ids:
    path = os.path.join(DATA_DIR, aid + ".json")
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    records.append(d)

print("loaded:", len(records))

# ---- 3. TF-IDF + cosine similarity over curated subset ----
texts = [r["content"] for r in records]
vectorizer = TfidfVectorizer(max_features=4000, stop_words="english", min_df=1)
X = vectorizer.fit_transform(texts)
sim = cosine_similarity(X)
print("tfidf shape:", X.shape)

# ---- 4. distinguishing terms per topic per bias (log-odds-ish via mean tfidf ratio) ----
feature_names = np.array(vectorizer.get_feature_names_out())
topic_keywords = {}
for topic in TOPICS:
    idxs = {"left": [], "center": [], "right": []}
    for i, r in enumerate(records):
        if r["topic"] == topic:
            idxs[r["bias_text"]].append(i)
    entry = {}
    for bias in ("left", "right"):
        other = "right" if bias == "left" else "left"
        if not idxs[bias] or not idxs[other]:
            entry[bias] = []
            continue
        mean_this = np.asarray(X[idxs[bias]].mean(axis=0)).ravel()
        mean_other = np.asarray(X[idxs[other]].mean(axis=0)).ravel()
        diff = mean_this - mean_other
        top = diff.argsort()[::-1][:8]
        words = [feature_names[t] for t in top if diff[t] > 0]
        entry[bias] = words[:6]
    topic_keywords[topic] = entry

# ---- 5. build article metadata for frontend ----
articles_out = []
for i, r in enumerate(records):
    articles_out.append({
        "id": r["ID"],
        "topic": r["topic"],
        "topicLabel": TOPIC_LABELS.get(r["topic"], r["topic"]),
        "source": r["source"],
        "biasText": r["bias_text"],
        "bias": BIAS_NUM[r["bias_text"]],
        "title": r["title"],
        "date": r.get("date", ""),
        "url": r["url"],
        "wordCount": len(r["content"].split()),
    })

# topic-level source diversity (distinct sources covering the topic in full dataset,
# approximated from our curated sample's source set to keep it a fair, real-ish signal)
topic_source_counts = {}
for topic in TOPICS:
    srcs = {r["source"] for r in records if r["topic"] == topic}
    topic_source_counts[topic] = len(srcs)
for a in articles_out:
    a["topicSourceCount"] = topic_source_counts[a["topic"]]

# ---- 6. write outputs ----
with open(os.path.join(OUT_DIR, "articles.json"), "w") as f:
    json.dump(articles_out, f)

# full pairwise similarity matrix, rounded to save space
sim_rounded = np.round(sim, 3).tolist()
with open(os.path.join(OUT_DIR, "similarity.json"), "w") as f:
    json.dump({"ids": [r["ID"] for r in records], "matrix": sim_rounded}, f)

with open(os.path.join(OUT_DIR, "keywords.json"), "w") as f:
    json.dump(topic_keywords, f)

topics_out = [{"id": t, "label": TOPIC_LABELS[t]} for t in TOPICS]
with open(os.path.join(OUT_DIR, "topics.json"), "w") as f:
    json.dump(topics_out, f)

print("wrote articles.json, similarity.json, keywords.json, topics.json to", OUT_DIR)
print("sample keywords for healthcare:", topic_keywords["healthcare"])
