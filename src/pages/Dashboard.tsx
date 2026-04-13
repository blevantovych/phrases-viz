import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Link } from '@tanstack/react-router';
import {
  videos,
  getTypeStats,
  getTopVideosByCount,
  shortTitle,
} from '../dataUtils';

const typeStats = getTypeStats();
const topVideos = getTopVideosByCount(15);
const totalExpressions = videos.reduce((s, v) => s + v.expressions.length, 0);
const avgPerVideo = (totalExpressions / videos.length).toFixed(1);
const topType = typeStats[0];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <div className="tooltip-title">{d.title || d.label || d.name}</div>
        <div className="tooltip-value">{payload[0].value} expressions</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Phrase & Idiom Dashboard</h1>
        <p className="page-subtitle">
          Extracted from {videos.length} chess commentary videos by GM Naroditsky
        </p>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Expressions" value={totalExpressions.toLocaleString()} />
        <StatCard label="Videos Analyzed" value={videos.length} />
        <StatCard label="Avg per Video" value={avgPerVideo} />
        <StatCard
          label="Most Common Type"
          value={topType.label}
          sub={`${topType.count} occurrences`}
        />
        <StatCard
          label="Unique Expressions"
          value={
            new Set(
              videos.flatMap((v) => v.expressions.map((e) => e.expression.toLowerCase()))
            ).size
          }
          sub="distinct phrases"
        />
        <StatCard
          label="Proverbs Found"
          value={typeStats.find((t) => t.type === 'proverb')?.count ?? 0}
          sub="across all videos"
        />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h2>Expressions by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeStats}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={110}
                paddingAngle={2}
                label={({ label, percent }: { label?: string; percent?: number }) =>
                  (percent ?? 0) > 0.04 ? `${label} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
                }
                labelLine={false}
              >
                {typeStats.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Type Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeStats} layout="vertical" margin={{ left: 120, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="label"
                type="category"
                tick={{ fontSize: 12 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {typeStats.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card full-width">
        <h2>Top 15 Videos by Expression Count</h2>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={topVideos.map((v) => ({ ...v, name: shortTitle(v.title, 40) }))}
            margin={{ bottom: 80, left: 10, right: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload as (typeof topVideos)[0];
                  return (
                    <div className="chart-tooltip">
                      <div className="tooltip-title" style={{ maxWidth: 280, whiteSpace: 'normal' }}>
                        {d.title}
                      </div>
                      <div className="tooltip-value">{d.count} expressions</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="top-videos-list">
          {topVideos.map((v, i) => (
            <Link key={v.id} to="/videos/$videoId" params={{ videoId: v.id }} className="rank-row">
              <span className="rank-num">#{i + 1}</span>
              <span className="rank-title">{shortTitle(v.title, 70)}</span>
              <span className="rank-count">{v.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
