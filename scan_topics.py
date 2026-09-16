import json, os, collections, time

DATA_DIR = "/home/claude/Article-Bias-Prediction/data/jsons"

t0 = time.time()
by_topic = collections.defaultdict(lambda: {"left": [], "center": [], "right": []})
total = 0
files = os.listdir(DATA_DIR)
print("files:", len(files))

for fn in files:
    path = os.path.join(DATA_DIR, fn)
    try:
        with open(path, "r", encoding="utf-8") as f:
            d = json.load(f)
    except Exception:
        continue
    total += 1
    topic = d.get("topic", "unknown")
    bias = d.get("bias_text")
    if bias in ("left", "center", "right"):
        by_topic[topic][bias].append(d.get("ID"))

print("parsed", total, "in", round(time.time() - t0, 1), "s")

# Rank topics by how balanced + large they are
scored = []
for topic, buckets in by_topic.items():
    l, c, r = len(buckets["left"]), len(buckets["center"]), len(buckets["right"])
    minb = min(l, c, r)
    total_n = l + c + r
    if minb >= 3:  # need real coverage on all 3 sides
        scored.append((minb, total_n, topic, l, c, r))

scored.sort(reverse=True)
print(f"\n{'topic':30s} {'min':>4s} {'total':>6s} {'L':>4s} {'C':>4s} {'R':>4s}")
for minb, total_n, topic, l, c, r in scored[:40]:
    print(f"{topic[:30]:30s} {minb:>4d} {total_n:>6d} {l:>4d} {c:>4d} {r:>4d}")

print("\ntotal topics with all 3 sides >=3:", len(scored))

# save full index for next step
with open("/home/claude/topic_index.json", "w") as f:
    json.dump(by_topic, f)
