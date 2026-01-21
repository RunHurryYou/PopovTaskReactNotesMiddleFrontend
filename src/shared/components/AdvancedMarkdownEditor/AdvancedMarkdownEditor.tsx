// components/AdvancedEditor.jsx
import { useMemo, useState, useEffect } from 'react';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import type { Options } from 'easymde';
import { useSelectedNote } from '../../../contexts/SelectedNote/hooks/useSelectedNote';
import { message } from 'antd';
import { useDebounce } from '../../hooks/useDebounce/useDebounce';
import { databaseService } from '../../../services/dataBaseService';

const AdvancedMarkdownEditor = () => {
    const { selectedNote, selectNote } = useSelectedNote();
    const [textValue, setTextValue] = useState(selectedNote?.content || '');
    const [isSaving, setIsSaving] = useState(false);
    
    const debouncedTextValue = useDebounce(textValue, 1000);
    
    useEffect(() => {
        setTextValue(selectedNote?.content || '');
    }, [selectedNote?.id]);

    useEffect(() => {
        const saveChanges = async () => {
            if (!selectedNote || !debouncedTextValue || 
                debouncedTextValue === selectedNote.content) {
                return;
            }

            try {
                setIsSaving(true);
                
                await databaseService.updateNote(selectedNote.id, {
                    content: debouncedTextValue,
                    title: selectedNote.title
                });
                
                if (selectNote) {
                    selectNote({
                        ...selectedNote,
                        content: debouncedTextValue,
                        updatedAt: new Date()
                    });
                }
                
                if (Math.abs(debouncedTextValue.length - (selectedNote.content?.length || 0)) > 10) {
                    message.success('Изменения сохранены', 1);
                }
                
            } catch (error) {
                console.error('Error saving note:', error);
                message.error('Ошибка при сохранении изменений');
            } finally {
                setIsSaving(false);
            }
        };

        saveChanges();
    }, [debouncedTextValue, selectedNote, selectNote]);

    const options: Options = useMemo(() => ({
        autofocus: false,
        spellChecker: false,
        placeholder: "Введите текст в формате Markdown...",
        status: false,
        toolbar: [
            "bold", "italic", "heading", "|",
            "quote", "unordered-list", "ordered-list", "|",
            "link", "image", "|",
            "preview", "side-by-side", "fullscreen"
        ],
        shortcuts: {
            toggleSideBySide: null,
            toggleFullScreen: null,
        }
    }), []);

    const handleChange = (newValue: string) => {
        setTextValue(newValue);
    };

    return (
        <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '4px',
            position: 'relative'
        }}>
            {isSaving && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 10,
                    background: 'rgba(255,255,255,0.8)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    Сохранение...
                </div>
            )}
            <SimpleMDE
                value={textValue}
                onChange={handleChange}
                options={options}
            />
        </div>
    );
};

export default AdvancedMarkdownEditor;