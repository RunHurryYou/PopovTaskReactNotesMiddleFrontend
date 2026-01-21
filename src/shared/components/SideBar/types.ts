export interface INote {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    id: string;
    login: string;
    password: string;
}