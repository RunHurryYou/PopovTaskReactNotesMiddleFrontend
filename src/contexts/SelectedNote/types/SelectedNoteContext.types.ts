import type { ReactNode } from "react";

export interface INoteContext {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SelectedNoteProviderProps {
  children: ReactNode;
  initialNote?: INoteContext | null;
}

export interface SelectedNoteContextType {
  selectedNote: INoteContext | null;
  selectNote: (note: INoteContext) => void;
  setNoteContent: (content: string) => void;
}