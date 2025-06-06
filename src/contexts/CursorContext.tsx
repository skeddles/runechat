import React, { createContext, useContext, useState, useEffect } from 'react';

type CursorContextType = {
	cursor: string;
	setCursor: (cursor: string) => void;
};

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [cursor, setCursor] = useState(() => {
		const savedCursor = localStorage.getItem('cursor');
		return savedCursor || 'gold';
	});

	useEffect(() => {
		localStorage.setItem('cursor', cursor);
	}, [cursor]);

	return (
		<CursorContext.Provider value={{ cursor, setCursor }}>
			{children}
		</CursorContext.Provider>
	);
};

export const useCursor = () => {
	const context = useContext(CursorContext);
	if (context === undefined) {
		throw new Error('useCursor must be used within a CursorProvider');
	}
	return context;
};
