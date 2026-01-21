import type { ReactNode } from "react";

export interface EditModeProviderProps {
  children: ReactNode;
  initialMode?: boolean;
}

export interface EditModeContextType {
  isEditMode: boolean;
  enableEditMode: () => void;
  disableEditMode: () => void;
}