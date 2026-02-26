export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  is_pinned: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'grid' | 'carousel';
