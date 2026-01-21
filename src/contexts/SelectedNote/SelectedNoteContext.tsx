import { createContext } from "react";
import type { SelectedNoteContextType } from "./types/SelectedNoteContext.types";

export const SelectedNoteContext = createContext<SelectedNoteContextType | undefined>(undefined);