import React, { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { TSignInCallback, TSignOutCallback } from "./types/context.types";

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
    const [user, setUser] = useState<string | null>(localStorage.getItem('user') || null);

    const signin = (newUser: string, callback: TSignInCallback)=>{
        setUser(newUser);
        localStorage.setItem('user', newUser);
        callback();
    }

    const signout = (callback: TSignOutCallback)=>{
        setUser(null);
        localStorage.removeItem('user');
        callback();
    }

    const value = {
        user,
        signin,
        signout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};