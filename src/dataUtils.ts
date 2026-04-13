import rawData from './data.json';
import type { Video, Expression } from './types';

export const videos: Video[] = rawData as Video[];

export const TYPE_COLORS: Record<string, string> = {
  idiom: '#6366f1',
  phrasal_verb: '#f59e0b',
  fixed_expression: '#10b981',
  colloquialism: '#ef4444',
  proverb: '#8b5cf6',
  metaphor: '#06b6d4',
  verb: '#84cc16',
  figurative_expression: '#f97316',
};

export const TYPE_LABELS: Record<string, string> = {
  idiom: 'Idiom',
  phrasal_verb: 'Phrasal Verb',
  fixed_expression: 'Fixed Expression',
  colloquialism: 'Colloquialism',
  proverb: 'Proverb',
  metaphor: 'Metaphor',
  verb: 'Verb',
  figurative_expression: 'Figurative Expression',
};

export function getTypeStats(): { type: string; count: number; color: string; label: string }[] {
  const counts: Record<string, number> = {};
  for (const video of videos) {
    for (const expr of video.expressions) {
      counts[expr.type] = (counts[expr.type] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      color: TYPE_COLORS[type] || '#999',
      label: TYPE_LABELS[type] || type,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getTopVideosByCount(limit = 10): (Video & { count: number })[] {
  return videos
    .map((v) => ({ ...v, count: v.expressions.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getAllExpressions(): (Expression & { videoId: string; videoTitle: string })[] {
  return videos.flatMap((v) =>
    v.expressions.map((e) => ({ ...e, videoId: v.id, videoTitle: v.title }))
  );
}

export function getVideoById(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}

export function shortTitle(title: string, max = 60): string {
  return title.length > max ? title.slice(0, max) + '…' : title;
}

export function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}
