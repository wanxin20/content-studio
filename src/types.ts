export type RewriteStatus = 'todo' | 'done' | 'published';

export interface Article {
  id: string;
  title: string;
  summary: string;
  author: string;
  updated: string;
  link: string;
  thumb: string;
  content: string;
  status: RewriteStatus;
}

export interface Source {
  id: string;
  name: string;
  platform: 'wechat' | 'xhs' | 'douyin';
}

export interface Draft {
  id: string;
  sourceArticleId: string;
  sourceTitle: string;
  sourceAuthor: string;
  sourceLink: string;
  promptUsed: string;
  rewrittenTitle: string;
  rewrittenContent: string;
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string;
}

export type View =
  | { kind: 'source'; sourceId: string }
  | { kind: 'drafts' }
  | { kind: 'published' }
  | { kind: 'settings' };
