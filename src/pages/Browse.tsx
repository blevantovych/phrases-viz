import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { getAllExpressions, TYPE_COLORS, TYPE_LABELS, shortTitle } from '../dataUtils';
import { TypeBadge } from '../components/TypeBadge';
import type { Expression } from '../types';

type Row = Expression & { videoId: string; videoTitle: string };

const allExprs = getAllExpressions();

const col = createColumnHelper<Row>();

const columns = [
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
    size: 280,
  }),
  col.accessor('videoTitle', {
    header: 'Video',
    size: 260,
    cell: (info) => (
      <Link
        to="/videos/$videoId"
        params={{ videoId: info.row.original.videoId }}
        className="video-link small"
      >
        {shortTitle(info.getValue(), 55)}
      </Link>
    ),
  }),
  col.accessor('quote', {
    header: 'Quote',
    cell: (info) => <em className="quote-cell">"{info.getValue()}"</em>,
  }),
];

const typeOptions = Object.entries(TYPE_LABELS).map(([type, label]) => ({ type, label }));

export default function Browse() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [pageSize, setPageSize] = useState(50);

  const data = useMemo(
    () => (typeFilter ? allExprs.filter((e) => e.type === typeFilter) : allExprs),
    [typeFilter]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination: { pageIndex: 0, pageSize } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  });

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of allExprs) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Browse All Expressions</h1>
        <p className="page-subtitle">{allExprs.length.toLocaleString()} expressions across all videos</p>
      </div>

      <div className="browse-filters">
        <input
          className="search-input large"
          placeholder="Search expressions, meanings, quotes, videos..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <div className="type-pills">
          <button
            className={`type-pill ${typeFilter === '' ? 'active' : ''}`}
            onClick={() => setTypeFilter('')}
          >
            All ({allExprs.length})
          </button>
          {typeOptions.map(({ type, label }) =>
            typeCounts[type] ? (
              <button
                key={type}
                className={`type-pill ${typeFilter === type ? 'active' : ''}`}
                style={
                  typeFilter === type
                    ? {
                        background: TYPE_COLORS[type] + '33',
                        borderColor: TYPE_COLORS[type],
                        color: TYPE_COLORS[type],
                      }
                    : {}
                }
                onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
              >
                {label} ({typeCounts[type]})
              </button>
            ) : null
          )}
        </div>
      </div>

      <div className="table-toolbar">
        <span className="table-count">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} results
        </span>
        <select
          className="page-size-select"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
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

      <div className="pagination">
        <button
          className="page-btn"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ← Prev
        </button>
        <span className="page-info">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          className="page-btn"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
