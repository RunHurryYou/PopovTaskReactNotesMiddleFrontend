import { createContext } from "react";
import type { IAuthContextType } from "./types/context.types";

export const AuthContext = createContext<IAuthContextType | null>(null);