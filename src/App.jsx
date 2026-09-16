import { useEffect, useState } from "react";
import Masthead from "./components/Masthead";
import ExposurePanel from "./components/ExposurePanel";
import Feed from "./components/Feed";
import ArticleDetail from "./components/ArticleDetail";
import EvaluationView from "./components/EvaluationView";
import AboutView from "./components/AboutView";
import { bucketOf, getArticle } from "./lib/recommender";

export default function App() {
  const [history, setHistory] = useState([]); // [{ id, bucket, topic }]
  const [tab, setTab] = useState("feed");
  const [openArticleId, setOpenArticleId] = useState(null);

  function navigate(next) {
    setTab(next);
    setOpenArticleId(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openArticle(id) {
    setOpenArticleId(id);
    setTab("feed");
    window.scrollTo({ top: 0, behavior: "instant" });

    setHistory((prev) => {
      if (prev.some((h) => h.id === id)) return prev;
      // bucket/topic recorded lazily via recommender's own article lookup
      return prev;
    });
  }

  function markRead(article) {
    setHistory((prev) => {
      if (prev.some((h) => h.id === article.id)) return prev;
      return [...prev, { id: article.id, bucket: bucketOf(article.bias), topic: article.topic }];
    });
  }

  function backToFeed() {
    setOpenArticleId(null);
  }

  return (
    <div className="min-h-screen">
      <Masthead active={tab} onNavigate={navigate} />
      <main className="max-w-6xl mx-auto px-5 py-8">
        {tab === "feed" && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <ExposurePanel history={history} />
            <div>
              {openArticleId ? (
                <TrackedArticleDetail
                  articleId={openArticleId}
                  history={history}
                  onBack={backToFeed}
                  onOpen={openArticle}
                  onRead={markRead}
                />
              ) : (
                <Feed history={history} onOpen={openArticle} />
              )}
            </div>
          </div>
        )}
        {tab === "evaluation" && <EvaluationView />}
        {tab === "about" && <AboutView />}
      </main>
      <footer className="max-w-6xl mx-auto px-5 py-10 text-xs text-[var(--color-paper-dim,#a9a696)] border-t border-[var(--color-rule)] mt-10">
        Article data and perspective labels from{" "}
        <a
          href="https://github.com/ramybaly/Article-Bias-Prediction"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[var(--color-rule)] hover:text-[var(--color-paper)]"
        >
          Article-Bias-Prediction
        </a>{" "}
        (Baly et al., EMNLP 2020), rated by AllSides. Session state only — resets on refresh.
      </footer>
    </div>
  );
}

// Small wrapper so opening an article both renders the detail view and
// records it into reading history exactly once, as an effect rather than
// a side effect during render.
function TrackedArticleDetail({ articleId, history, onBack, onOpen, onRead }) {
  useEffect(() => {
    const a = getArticle(articleId);
    if (a) onRead(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return (
    <ArticleDetail articleId={articleId} history={history} onBack={onBack} onOpen={onOpen} />
  );
}
