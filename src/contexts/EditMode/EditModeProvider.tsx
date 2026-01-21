import React, { useState } from 'react';
import type { EditModeContextType, EditModeProviderProps } from './types/EditModeContext.types';
import { EditModeContext } from './EditModeContext';


export const EditModeProvider: React.FC<EditModeProviderProps> = ({
	children,
	initialMode = false
}) => {
	const [isEditMode, setIsEditMode] = useState<boolean>(initialMode);

	const enableEditMode = () => {
		setIsEditMode(true);
	};

	const disableEditMode = () => {
		setIsEditMode(false);
	};

	const value: EditModeContextType = {
		isEditMode,
		enableEditMode,
		disableEditMode
	};

	return (
		<EditModeContext.Provider value={value}>
			{children}
		</EditModeContext.Provider>
	);
};
