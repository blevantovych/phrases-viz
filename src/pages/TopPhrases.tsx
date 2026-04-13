import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getAllExpressions, TYPE_COLORS, TYPE_LABELS } from '../dataUtils';

interface PhraseFreq {
  expression: string;
  count: number;
  type: string;
  meaning: string;
  videoIds: string[];
  urls: string[];
}

const allExprs = getAllExpressions();

function buildFreqMap(): Record<string, PhraseFreq[]> {
  const map: Record<string, Record<string, PhraseFreq>> = {};

  for (const e of allExprs) {
    const key = e.expression.toLowerCase().trim();
    if (!map[e.type]) map[e.type] = {};
    if (!map[e.type][key]) {
      map[e.type][key] = {
        expression: e.expression,
        count: 0,
        type: e.type,
        meaning: e.meaning,
        videoIds: [],
        urls: [],
      };
    }
    map[e.type][key].count += 1;
    if (!map[e.type][key].videoIds.includes(e.videoId)) {
      map[e.type][key].videoIds.push(e.videoId);
    }
    map[e.type][key].urls.push(e.youtube_url);
  }

  const result: Record<string, PhraseFreq[]> = {};
  for (const [type, phrases] of Object.entries(map)) {
    result[type] = Object.values(phrases).sort((a, b) => b.count - a.count);
  }
  return result;
}

const freqMap = buildFreqMap();

const TYPE_ORDER = [
  'phrasal_verb',
  'idiom',
  'colloquialism',
  'fixed_expression',
  'proverb',
  'metaphor',
  'verb',
  'figurative_expression',
];

export default function TopPhrases() {
  const [activeType, setActiveType] = useState<string>('phrasal_verb');
  const [showTop, setShowTop] = useState(20);
  const [expanded, setExpanded] = useState<string | null>(null);

  const phrases = (freqMap[activeType] || []).slice(0, showTop);
  const color = TYPE_COLORS[activeType] || '#6366f1';

  return (
    <div className="page">
      <div className="page-header">
        <h1>Most Common Expressions by Type</h1>
        <p className="page-subtitle">
          Ranked by frequency across all {allExprs.length.toLocaleString()} extracted expressions
        </p>
      </div>

      <div className="type-tabs">
        {TYPE_ORDER.filter((t) => freqMap[t]).map((type) => {
          const total = freqMap[type].length;
          const topCount = freqMap[type][0]?.count ?? 0;
          return (
            <button
              key={type}
              className={`type-tab ${activeType === type ? 'active' : ''}`}
              style={
                activeType === type
                  ? {
                      borderColor: TYPE_COLORS[type],
                      color: TYPE_COLORS[type],
                      background: TYPE_COLORS[type] + '18',
                    }
                  : {}
              }
              onClick={() => {
                setActiveType(type);
                setExpanded(null);
              }}
            >
              <span className="tab-label">{TYPE_LABELS[type] || type}</span>
              <span className="tab-meta">{total} unique · top {topCount}×</span>
            </button>
          );
        })}
      </div>

      <div className="top-phrases-layout">
        <div className="chart-card top-chart">
          <h2>
            Top {Math.min(showTop, phrases.length)} {TYPE_LABELS[activeType] || activeType}s
          </h2>
          <div className="show-top-control">
            {[10, 20, 30].map((n) => (
              <button
                key={n}
                className={`show-top-btn ${showTop === n ? 'active' : ''}`}
                style={showTop === n ? { borderColor: color, color } : {}}
                onClick={() => setShowTop(n)}
              >
                Top {n}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={Math.max(280, phrases.length * 28)}>
            <BarChart
              data={phrases}
              layout="vertical"
              margin={{ left: 180, right: 40, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                allowDecimals={false}
              />
              <YAxis
                dataKey="expression"
                type="category"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                width={180}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const d = payload[0].payload as PhraseFreq;
                    return (
                      <div className="chart-tooltip">
                        <div className="tooltip-title">{d.expression}</div>
                        <div className="tooltip-value">{d.count}× across {d.videoIds.length} video{d.videoIds.length !== 1 ? 's' : ''}</div>
                        <div className="tooltip-meaning">{d.meaning}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                fill={color}
                onClick={(d: any) =>
                  setExpanded(expanded === d.expression ? null : d.expression)
                }
                cursor="pointer"
              >
                {phrases.map((entry) => (
                  <Cell
                    key={entry.expression}
                    fill={expanded === entry.expression ? color : color + 'bb'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="phrase-list-panel">
          <h3>
            Ranked list
            <span className="panel-sub"> — click a row to expand</span>
          </h3>
          <div className="phrase-rows">
            {phrases.map((p, i) => (
              <div
                key={p.expression}
                className={`phrase-row ${expanded === p.expression ? 'open' : ''}`}
                onClick={() => setExpanded(expanded === p.expression ? null : p.expression)}
              >
                <div className="phrase-row-top">
                  <span className="pr-rank">#{i + 1}</span>
                  <span className="pr-expr">{p.expression}</span>
                  <span
                    className="pr-count"
                    style={{ color }}
                  >
                    {p.count}×
                  </span>
                  <span className="pr-videos">{p.videoIds.length}v</span>
                </div>
                {expanded === p.expression && (
                  <div className="phrase-row-detail">
                    <div className="prd-meaning">{p.meaning}</div>
                    <div className="prd-links">
                      {p.urls.slice(0, 8).map((url, j) => (
                        <a
                          key={j}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="prd-link"
                          style={{ borderColor: color + '55', color }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          #{j + 1} ↗
                        </a>
                      ))}
                      {p.urls.length > 8 && (
                        <span className="prd-more">+{p.urls.length - 8} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
