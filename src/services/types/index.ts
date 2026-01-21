export interface INote {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string; // Связь с пользователем
}

export interface IUser {
    id: string;
    login: string;
    password: string;
    createdAt: Date;
}

// Типы для данных в Firebase (без методов Date)
export interface FirebaseNote {
    id: string;
    title: string;
    content: string;
    createdAt: number; // timestamp в Firebase
    updatedAt: number; // timestamp в Firebase
    userId: string;
}

export interface FirebaseUser {
    id: string;
    login: string;
    password: string;
    createdAt: number; // timestamp в Firebase
}

// Функции преобразования
export const convertToFirebaseNote = (note: INote): FirebaseNote => ({
    ...note,
    createdAt: note.createdAt.getTime(),
    updatedAt: note.updatedAt.getTime()
});

export const convertFromFirebaseNote = (firebaseNote: FirebaseNote): INote => ({
    ...firebaseNote,
    createdAt: new Date(firebaseNote.createdAt),
    updatedAt: new Date(firebaseNote.updatedAt)
});

export const convertToFirebaseUser = (user: IUser): FirebaseUser => ({
    ...user,
    createdAt: user.createdAt.getTime()
});

export const convertFromFirebaseUser = (firebaseUser: FirebaseUser): IUser => ({
    ...firebaseUser,
    createdAt: new Date(firebaseUser.createdAt)
});