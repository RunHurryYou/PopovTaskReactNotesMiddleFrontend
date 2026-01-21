import { createContext } from "react";
import type { EditModeContextType } from "./types/EditModeContext.types";

export const EditModeContext = createContext<EditModeContextType | undefined>(undefined);