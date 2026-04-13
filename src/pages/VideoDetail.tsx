import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
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
import { getVideoById, TYPE_COLORS, TYPE_LABELS, formatDuration } from '../dataUtils';
import { TypeBadge } from '../components/TypeBadge';
import type { Expression } from '../types';

const col = createColumnHelper<Expression & { index: number }>();

const columns = [
  col.accessor('index', {
    header: '#',
    size: 50,
    cell: (info) => <span className="row-num">{info.getValue()}</span>,
  }),
  col.accessor('expression', {
    header: 'Expression',
    size: 200,
    cell: (info) => (
      <a
        href={info.row.original.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="expr-link"
      >
        {info.getValue()}
      </a>
    ),
  }),
  col.accessor('type', {
    header: 'Type',
    size: 150,
    cell: (info) => <TypeBadge type={info.getValue()} />,
  }),
  col.accessor('meaning', {
    header: 'Meaning',
    size: 300,
  }),
  col.accessor('quote', {
    header: 'Quote',
    cell: (info) => <em className="quote-cell">"{info.getValue()}"</em>,
  }),
];

export default function VideoDetail() {
  const { videoId } = useParams({ from: '/videos/$videoId' });
  const video = getVideoById(videoId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  if (!video) {
    return (
      <div className="page">
        <p>Video not found.</p>
        <Link to="/videos">← Back to videos</Link>
      </div>
    );
  }

  const typeStats = Object.entries(
    video.expressions.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([type, count]) => ({ type, count, color: TYPE_COLORS[type] || '#999', label: TYPE_LABELS[type] || type }))
    .sort((a, b) => b.count - a.count);

  const filteredExprs = video.expressions.filter((e) =>
    typeFilter ? e.type === typeFilter : true
  );

  const tableData = filteredExprs.map((e, i) => ({ ...e, index: i + 1 }));

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/videos" className="back-link">← All Videos</Link>
        <h1 style={{ marginTop: 8 }}>{video.title}</h1>
        <p className="page-subtitle">
          {formatDuration(video.duration)} · {video.expressions.length} expressions ·{' '}
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="yt-link">
            Watch on YouTube ↗
          </a>
        </p>
      </div>

      <div className="detail-charts-row">
        <div className="chart-card mini">
          <h3>Types in this video</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeStats} layout="vertical" margin={{ left: 120, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(val) => [val, 'count']} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {typeStats.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="type-filter-panel">
          <h3>Filter by Type</h3>
          <div className="type-filter-list">
            <button
              className={`type-filter-btn ${typeFilter === '' ? 'active' : ''}`}
              onClick={() => setTypeFilter('')}
            >
              All ({video.expressions.length})
            </button>
            {typeStats.map((t) => (
              <button
                key={t.type}
                className={`type-filter-btn ${typeFilter === t.type ? 'active' : ''}`}
                style={typeFilter === t.type ? { borderColor: t.color, background: t.color + '22', color: t.color } : {}}
                onClick={() => setTypeFilter(t.type === typeFilter ? '' : t.type)}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-toolbar">
        <input
          className="search-input"
          placeholder="Search expressions, meanings, quotes..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <span className="table-count">
          {table.getFilteredRowModel().rows.length} of {filteredExprs.length}
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? 'sortable' : ''}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' ↑'}
                    {header.column.getIsSorted() === 'desc' && ' ↓'}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
