const TABS = [
  { key: "feed", label: "Feed" },
  { key: "evaluation", label: "Evaluation" },
  { key: "about", label: "About the algorithm" },
];

export default function Masthead({ active, onNavigate }) {
  return (
    <header className="border-b border-[var(--color-rule)]">
      <div className="max-w-6xl mx-auto px-5 pt-6 pb-4 flex items-baseline justify-between flex-wrap gap-3">
        <button
          onClick={() => onNavigate("feed")}
          className="text-left group"
          aria-label="Go to feed"
        >
          <span className="font-display text-4xl sm:text-5xl tracking-tight text-[var(--color-paper)]">
            PRISM
          </span>
          <span className="block mt-1 text-sm text-[var(--color-paper-dim,#a9a696)] font-ui">
            A diversity-aware news recommender
          </span>
        </button>
        <div className="hidden sm:block h-1 w-40 spectrum-gradient rounded-none" />
      </div>
      <nav className="max-w-6xl mx-auto px-5 flex gap-1 -mb-px">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onNavigate(t.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors ${
              active === t.key
                ? "border-[var(--color-amber)] text-[var(--color-paper)]"
                : "border-transparent text-[var(--color-paper-dim,#a9a696)] hover:text-[var(--color-paper)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
