export type TSignOutCallback = () => void

export type TSignInCallback = () => void;

export interface IAuthContextType {
    user: string | null,
    signin: (newUser: string, callback: TSignInCallback)=>void
    signout: (callback: TSignOutCallback) => void
}