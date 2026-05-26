import { create } from 'zustand';
import type { Article } from '../types';

interface AppState {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  /** Article queued for the rewrite workbench (set when user clicks "送去改写"). */
  rewriteArticle: Article | null;
  setRewriteArticle: (a: Article | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
  rewriteArticle: null,
  setRewriteArticle: (a) => set({ rewriteArticle: a }),
}));
