import { useContext } from "react";
import type { EditModeContextType } from "../types/EditModeContext.types";
import { EditModeContext } from "../EditModeContext";

export const useEditMode = (): EditModeContextType => {
  const context = useContext(EditModeContext);
  
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  
  return context;
};