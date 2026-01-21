export interface EditorRefType {
		getContent(): unknown;
		setContent(arg0: string): unknown;
        codemirror: {
            focus: () => void;
            setCursor: (cursor: { line: number; ch: number }) => void;
        }
}