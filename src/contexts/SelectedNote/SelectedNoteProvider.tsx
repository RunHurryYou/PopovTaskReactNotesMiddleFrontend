import React, { useState } from 'react';
import type { INoteContext, SelectedNoteContextType, SelectedNoteProviderProps } from './types/SelectedNoteContext.types';
import { SelectedNoteContext } from './SelectedNoteContext';


export const SelectedNoteProvider: React.FC<SelectedNoteProviderProps> = ({
	children,
	initialNote = null
}) => {
	const [selectedNote, setSelectedNote] = useState<INoteContext | null>(initialNote);

    const selectNote = (note: INoteContext) => {
        setSelectedNote(note);
    };

	const setNoteContent = (content: string) => {
		if (selectedNote) {
			setSelectedNote({ ...selectedNote, content });
		}
	}
	const value: SelectedNoteContextType = {
		selectedNote,
        selectNote,
		setNoteContent
	};

	return (
		<SelectedNoteContext.Provider value={value}>
			{children}
		</SelectedNoteContext.Provider>
	);
};
