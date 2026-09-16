import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import evaluation from "../data/evaluation.json";

const chartData = evaluation.traditional.diversitySeries.map((_, i) => ({
  step: i,
  Traditional: evaluation.traditional.diversitySeries[i],
  PRISM: evaluation.prism.diversitySeries[i],
}));

const metricRows = [
  { key: "finalDiversity", label: "Diversity index after 30 reads", higherBetter: true },
  { key: "altPerspectiveClickRate", label: "Share of reads that were a different perspective", higherBetter: true },
  { key: "avgTopicRelevance", label: "Average topic relevance of picks", higherBetter: true },
  { key: "distinctTopicsExplored", label: "Distinct topics explored", higherBetter: true },
];

export default function EvaluationView() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-2">Traditional vs. PRISM</h1>
      <p className="text-sm text-[var(--color-paper-dim,#a9a696)] mb-8 leading-relaxed">
        Both strategies were run on the same curated dataset, seeded with an
        identical simulated reading bubble (three initial reads from one
        perspective bucket), then let greedily pick whichever candidate its
        own scoring formula ranked highest, for 30 rounds. Traditional scores
        candidates on topic relevance, content similarity, and reinforcement
        of the bucket already read — the actual mechanic behind real
        engagement-optimized feeds. PRISM swaps that reinforcement term for an
        explicit diversity bonus. Results below are averaged over four seeded
        runs (two left-seeded, two right-seeded), not hand-picked numbers.
      </p>

      <div className="border border-[var(--color-rule)] rounded-sm p-5 mb-8">
        <h2 className="text-sm mb-4">Diversity index over 30 simulated reads</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="var(--color-rule)" strokeDasharray="3 3" />
            <XAxis dataKey="step" stroke="var(--color-paper-dim,#a9a696)" fontSize={12} />
            <YAxis domain={[0, 1]} stroke="var(--color-paper-dim,#a9a696)" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "var(--color-ink)", border: "1px solid var(--color-rule)" }}
            />
            <Legend />
            <Line type="monotone" dataKey="Traditional" stroke="var(--color-spec-right)" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="PRISM" stroke="var(--color-amber)" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-[var(--color-rule)] rounded-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-rule)] text-left text-xs text-[var(--color-paper-dim,#a9a696)]">
              <th className="p-3 font-normal">Metric</th>
              <th className="p-3 font-normal text-right">Traditional</th>
              <th className="p-3 font-normal text-right">PRISM</th>
            </tr>
          </thead>
          <tbody>
            {metricRows.map((row) => (
              <tr key={row.key} className="border-b border-[var(--color-rule)] last:border-0">
                <td className="p-3">{row.label}</td>
                <td className="p-3 text-right tabular-nums">{evaluation.traditional[row.key]}</td>
                <td className="p-3 text-right tabular-nums text-[var(--color-amber)]">
                  {evaluation.prism[row.key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-[var(--color-paper-dim,#a9a696)] leading-relaxed space-y-2">
        <p>
          <strong className="text-[var(--color-paper)]">Reading it honestly:</strong> PRISM
          trades some topic exploration for a large diversity gain — Traditional explores more
          distinct topics because its bucket-reinforcement term lets it chase a topic-relevance
          signal that gets diluted less by a fixed bias preference. That trade-off is a real,
          known property of diversity-aware re-ranking, not a flaw specific to this
          implementation.
        </p>
      </div>
    </div>
  );
}
