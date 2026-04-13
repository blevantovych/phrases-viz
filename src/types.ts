export type ExpressionType =
  | 'idiom'
  | 'phrasal_verb'
  | 'fixed_expression'
  | 'colloquialism'
  | 'proverb'
  | 'metaphor'
  | 'verb'
  | 'figurative_expression';

export interface Expression {
  expression: string;
  type: ExpressionType;
  meaning: string;
  quote: string;
  timestamp_seconds: number;
  youtube_url: string;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
  expressions: Expression[];
}
