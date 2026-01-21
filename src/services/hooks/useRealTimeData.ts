import { useEffect, useState } from 'react';
import { databaseService } from '../dataBaseService';
import { type INote } from '../types';

export function useUserNotes(userId: string | null) {
    const [notes, setNotes] = useState<INote[]>([]);

    useEffect(() => {
        const setNewNotes = (userNotes: INote[])=>{
            setNotes(userNotes);
        }
        if (!userId) {
            setNewNotes([]);
            return;
        }

        const unsubscribe = databaseService.subscribeToUserNotes(
            userId,
            (userNotes) => {
                setNewNotes(userNotes);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [userId]);

    return { notes };
}

export function useSingleNote(noteId: string | null) {
    const [note, setNote] = useState<INote | null>(null);

    useEffect(() => {
        const setNewNote = (noteData: INote | null) => {
            setNote(noteData);
        }
        if (!noteId) {
            setNewNote(null);
            return;
        }


        const unsubscribe = databaseService.subscribeToNote(noteId, (noteData) => {
            setNewNote(noteData);
        });

        return () => {
            unsubscribe();
        };
    }, [noteId]);

    return { note};
}