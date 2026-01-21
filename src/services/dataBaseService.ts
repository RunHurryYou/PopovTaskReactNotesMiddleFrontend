import { 
    ref, 
    set, 
    get, 
    push, 
    update, 
    remove, 
    onValue, 
    off,
    query,
    orderByChild,
    equalTo
} from 'firebase/database';
import { db } from '../firebase/firebase.config';
import { 
    type INote, 
    type IUser, 
    type FirebaseNote, 
    type FirebaseUser, 
    convertToFirebaseNote, 
    convertFromFirebaseNote,
    convertToFirebaseUser,
    convertFromFirebaseUser
} from './types';
const DB_PATHS = {
    USERS: 'users',
    NOTES: 'notes',
    USER_NOTES: (userId: string) => `user_notes/${userId}`,
} as const;

class DatabaseService {
    async createUser(user: Omit<IUser, 'id' | 'createdAt'>): Promise<string> {
        try {
            const userRef = push(ref(db, DB_PATHS.USERS));
            const newUser: IUser = {
                ...user,
                id: userRef.key!,
                createdAt: new Date()
            };
            
            const firebaseUser = convertToFirebaseUser(newUser);
            await set(userRef, firebaseUser);
            
            return newUser.id;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async getUser(userId: string): Promise<IUser | null> {
        try {
            const snapshot = await get(ref(db, `${DB_PATHS.USERS}/${userId}`));
            if (snapshot.exists()) {
                return convertFromFirebaseUser(snapshot.val() as FirebaseUser);
            }
            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    async getUserByLogin(login: string): Promise<IUser | null> {
        try {
            const usersQuery = query(
                ref(db, DB_PATHS.USERS),
                orderByChild('login'),
                equalTo(login)
            );
            
            const snapshot = await get(usersQuery);
            if (snapshot.exists()) {
                const users = snapshot.val();
                const userId = Object.keys(users)[0];
                return convertFromFirebaseUser(users[userId]);
            }
            return null;
        } catch (error) {
            console.error('Error getting user by login:', error);
            throw error;
        }
    }

    async authenticateUser(login: string, password: string): Promise<IUser | null> {
        const user = await this.getUserByLogin(login);
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    async createNote(
        noteData: Omit<INote, 'id' | 'createdAt' | 'updatedAt'>,
        userId: string
    ): Promise<string> {
        try {
            const noteRef = push(ref(db, DB_PATHS.NOTES));
            const userNoteRef = push(ref(db, DB_PATHS.USER_NOTES(userId)));
            
            const newNote: INote = {
                ...noteData,
                id: noteRef.key!,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId
            };
            
            const firebaseNote = convertToFirebaseNote(newNote);
            
            // Сохраняем в основной коллекции заметок
            await set(noteRef, firebaseNote);
            
            // Сохраняем связь в user_notes
            await set(userNoteRef, {
                noteId: newNote.id,
                createdAt: newNote.createdAt.getTime()
            });
            
            return newNote.id;
        } catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    }

    async getNote(noteId: string): Promise<INote | null> {
        try {
            const snapshot = await get(ref(db, `${DB_PATHS.NOTES}/${noteId}`));
            if (snapshot.exists()) {
                return convertFromFirebaseNote(snapshot.val() as FirebaseNote);
            }
            return null;
        } catch (error) {
            console.error('Error getting note:', error);
            throw error;
        }
    }

    async getUserNotes(userId: string): Promise<INote[]> {
        try {
            // Получаем связи заметок пользователя
            const userNotesRef = ref(db, DB_PATHS.USER_NOTES(userId));
            const userNotesSnapshot = await get(userNotesRef);
            
            if (!userNotesSnapshot.exists()) {
                return [];
            }
            
            const userNotes = userNotesSnapshot.val();
            const noteIds = Object.values(userNotes).map((item: any) => item.noteId);
            
            // Получаем данные заметок
            const notesPromises = noteIds.map((noteId: string) => 
                this.getNote(noteId)
            );
            
            const notes = await Promise.all(notesPromises);
            return notes.filter((note): note is INote => note !== null);
        } catch (error) {
            console.error('Error getting user notes:', error);
            throw error;
        }
    }

    async updateNote(noteId: string, updates: Partial<Omit<INote, 'id' | 'createdAt' | 'userId'>>): Promise<void> {
        try {
            const note = await this.getNote(noteId);
            if (!note) {
                throw new Error('Note not found');
            }
            
            const updatedNote: INote = {
                ...note,
                ...updates,
                updatedAt: new Date()
            };
            
            const firebaseNote = convertToFirebaseNote(updatedNote);
            await update(ref(db, `${DB_PATHS.NOTES}/${noteId}`), firebaseNote);
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    }

    async deleteNote(noteId: string, userId: string): Promise<void> {
        try {
            // Удаляем из основной коллекции
            await remove(ref(db, `${DB_PATHS.NOTES}/${noteId}`));
            
            // Удаляем связь из user_notes
            const userNotesRef = ref(db, DB_PATHS.USER_NOTES(userId));
            const userNotesSnapshot = await get(userNotesRef);
            
            if (userNotesSnapshot.exists()) {
                const userNotes = userNotesSnapshot.val();
                const noteEntries = Object.entries(userNotes);
                
                for (const [key, value] of noteEntries) {
                    const noteItem = value as { noteId: string };
                    if (noteItem.noteId === noteId) {
                        await remove(ref(db, `${DB_PATHS.USER_NOTES(userId)}/${key}`));
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    }

    subscribeToUserNotes(
        userId: string, 
        callback: (notes: INote[]) => void
    ): () => void {
        const userNotesRef = ref(db, DB_PATHS.USER_NOTES(userId));
        
        const unsubscribe = onValue(userNotesRef, async (snapshot) => {
            if (snapshot.exists()) {
                const userNotes = snapshot.val();
                const noteIds = Object.values(userNotes).map((item: any) => item.noteId);
                
                // Получаем актуальные данные заметок
                const notesPromises = noteIds.map((noteId: string) => 
                    this.getNote(noteId)
                );
                
                const notes = await Promise.all(notesPromises);
                const validNotes = notes.filter((note): note is INote => note !== null);
                
                // Сортируем по дате создания (новые сверху)
                validNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                
                callback(validNotes);
            } else {
                callback([]);
            }
        });
        
        return () => {
            off(userNotesRef, 'value', unsubscribe);
        };
    }

    subscribeToNote(noteId: string, callback: (note: INote | null) => void): () => void {
        const noteRef = ref(db, `${DB_PATHS.NOTES}/${noteId}`);
        
        const unsubscribe = onValue(noteRef, (snapshot) => {
            if (snapshot.exists()) {
                const note = convertFromFirebaseNote(snapshot.val() as FirebaseNote);
                callback(note);
            } else {
                callback(null);
            }
        });
        
        return () => {
            off(noteRef, 'value', unsubscribe);
        };
    }
}

export const databaseService = new DatabaseService();