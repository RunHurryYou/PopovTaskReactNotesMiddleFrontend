import { useContext } from "react";
import type { SelectedNoteContextType } from "../types/SelectedNoteContext.types";
import { SelectedNoteContext } from "../SelectedNoteContext";

export const useSelectedNote = (): SelectedNoteContextType => {
  const context = useContext(SelectedNoteContext);
  
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  
  return context;
};