import { TYPE_COLORS, TYPE_LABELS } from '../dataUtils';

export function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || '#999';
  return (
    <span
      className="type-badge"
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {TYPE_LABELS[type] || type}
    </span>
  );
}
