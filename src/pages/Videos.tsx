import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { videos, shortTitle, formatDuration, TYPE_COLORS } from '../dataUtils';
import type { Video } from '../types';

type VideoRow = Video & {
  count: number;
  idioms: number;
  phrasal: number;
  proverbs: number;
  colloquialisms: number;
};

const rows: VideoRow[] = videos.map((v) => ({
  ...v,
  count: v.expressions.length,
  idioms: v.expressions.filter((e) => e.type === 'idiom').length,
  phrasal: v.expressions.filter((e) => e.type === 'phrasal_verb').length,
  proverbs: v.expressions.filter((e) => e.type === 'proverb').length,
  colloquialisms: v.expressions.filter((e) => e.type === 'colloquialism').length,
}));

const col = createColumnHelper<VideoRow>();

const columns = [
  col.accessor('title', {
    header: 'Video',
    cell: (info) => (
      <Link to="/videos/$videoId" params={{ videoId: info.row.original.id }} className="video-link">
        {shortTitle(info.getValue(), 65)}
      </Link>
    ),
    size: 420,
  }),
  col.accessor('duration', {
    header: 'Duration',
    cell: (info) => formatDuration(info.getValue()),
    size: 90,
  }),
  col.accessor('count', {
    header: 'Total',
    cell: (info) => <strong>{info.getValue()}</strong>,
    size: 70,
  }),
  col.accessor('idioms', {
    header: () => <span style={{ color: TYPE_COLORS.idiom }}>Idioms</span>,
    size: 80,
  }),
  col.accessor('phrasal', {
    header: () => <span style={{ color: TYPE_COLORS.phrasal_verb }}>Phrasal</span>,
    size: 80,
  }),
  col.accessor('colloquialisms', {
    header: () => <span style={{ color: TYPE_COLORS.colloquialism }}>Colloq.</span>,
    size: 80,
  }),
  col.accessor('proverbs', {
    header: () => <span style={{ color: TYPE_COLORS.proverb }}>Proverbs</span>,
    size: 80,
  }),
];

export default function Videos() {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'count', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: rows,
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
        <h1>All Videos</h1>
        <p className="page-subtitle">{rows.length} videos — click a title to see its expressions</p>
      </div>

      <div className="table-toolbar">
        <input
          className="search-input"
          placeholder="Search videos..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <span className="table-count">
          {table.getFilteredRowModel().rows.length} of {rows.length}
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
