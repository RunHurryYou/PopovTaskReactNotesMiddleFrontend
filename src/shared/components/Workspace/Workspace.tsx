import ReactMarkdown from 'react-markdown';
import { Button, Card, message, Space, Typography, Input, type InputRef } from "antd";
import AdvancedMarkdownEditor from "../AdvancedMarkdownEditor/AdvancedMarkdownEditor";
import { useEditMode } from "../../../contexts/EditMode/hooks/useEditMode";
import { EditOutlined, SaveOutlined, UndoOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelectedNote } from '../../../contexts/SelectedNote/hooks/useSelectedNote';
import { databaseService } from '../../../services/dataBaseService';

const { Text } = Typography;

export const Workspace = () => {
	const editMode = useEditMode();
	const { selectedNote, selectNote } = useSelectedNote();
	const [tempTitle, setTempTitle] = useState('');
	const [snapshot, setSnapshot] = useState<{ content: string, title: string } | null>(null);
	const prevNoteIdRef = useRef<string | null>(null);
	const titleInputRef = useRef<InputRef>(null);

	const disableEditMode = editMode.disableEditMode;
	const enableEditMode = editMode.enableEditMode;
	const isEditMode = editMode.isEditMode;

	useEffect(() => {
		const setNewStates = () => {
			if (!selectedNote) return;

			if (selectedNote.id !== prevNoteIdRef.current) {
				setTempTitle(selectedNote.title || '');
				setSnapshot(null);
				prevNoteIdRef.current = selectedNote.id;
			}

			if (isEditMode && !snapshot) {
				console.log("Создание снапшота для:", selectedNote.id);
				setSnapshot({
					content: selectedNote.content || '',
					title: selectedNote.title || ''
				});
			}
		}

		setNewStates();
	}, [selectedNote, isEditMode, snapshot]);

	const handleTitleSave = useCallback(async () => {
		if (!selectedNote || !tempTitle.trim()) return;
		try {
			await databaseService.updateNote(selectedNote.id, {
				title: tempTitle.trim()
			});

			selectNote({
				id: selectedNote.id,
				title: tempTitle.trim(),
				content: selectedNote.content,
				createdAt: selectedNote.createdAt,
				updatedAt: new Date()
			});
		} catch (error) {
			message.error('Ошибка при сохранении названия');
			console.error(error);
		}
	}, [selectedNote, tempTitle, selectNote]);

	const revertChanges = useCallback(async () => {
		if (!selectedNote || !snapshot) return;

		try {
			await databaseService.updateNote(selectedNote.id, {
				content: snapshot.content,
				title: snapshot.title
			});

			selectNote({
				id: selectedNote.id,
				title: snapshot.title,
				content: snapshot.content,
				createdAt: selectedNote.createdAt,
				updatedAt: new Date()
			});

			setTempTitle(snapshot.title);

			disableEditMode();
			setSnapshot(null);
			message.info('Изменения отменены');
		} catch (error) {
			message.error('Ошибка при отмене изменений');
			console.error(error);
		}
	}, [selectedNote, snapshot, selectNote, disableEditMode]);

	const handleSave = useCallback(async () => {
		if (!selectedNote) return;
		try {
			if (tempTitle.trim() !== selectedNote.title) {
				await databaseService.updateNote(selectedNote.id, {
					title: tempTitle.trim()
				});
			}
			setSnapshot(null);
			disableEditMode();

			message.success('Изменения сохранены');
		} catch (error) {
			message.error('Ошибка при сохранении');
			console.error(error);
		}
	}, [selectedNote, tempTitle, selectNote, disableEditMode]);

	const handleStartEdit = useCallback(() => {
		if (!selectedNote) return;
		setSnapshot({
			content: selectedNote.content || '',
			title: selectedNote.title || ''
		});
		setTempTitle(selectedNote.title || '');
		enableEditMode();
	}, [selectedNote, enableEditMode]);

	if (!selectedNote) {
		return (
			<div
				style={{
					width: '80%',
					height: '100vh',
					boxSizing: 'border-box',
					margin: '0 auto',
					marginTop: 16,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Card style={{ textAlign: 'center' }}>
					<Text type="secondary" style={{ fontSize: '16px' }}>
						У вас нет заметок. Создайте новую заметку чтобы начать работу.
					</Text>
				</Card>
			</div>
		);
	}

	return (
		<div
			style={{
				width: '80%',
				height: '100vh',
				boxSizing: 'border-box',
				margin: '0 auto',
				marginTop: 16
			}}
		>
			<Card
				title={
					<Space direction="vertical" style={{ width: '100%' }}>
						{isEditMode ? (
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<Input
									ref={titleInputRef}
									value={tempTitle}
									onChange={(e) => setTempTitle(e.target.value)}
									onBlur={handleTitleSave}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											handleTitleSave();
										}
									}}
									placeholder="Название заметки"
									style={{ flex: 1 }}
									allowClear
								/>
							</div>
						) : (
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<Text strong>{selectedNote.title}</Text>
							</div>
						)}
					</Space>
				}
				extra={
					isEditMode ? (
						<Space>
							<Button
								type="primary"
								icon={<SaveOutlined />}
								onClick={handleSave}
							>
								Сохранить
							</Button>
							<Button
								icon={<UndoOutlined />}
								onClick={revertChanges}
								danger
								disabled={!snapshot}
							>
								Отмена
							</Button>
						</Space>
					) : (
						<Space>
							<Button
								type="primary"
								icon={<EditOutlined />}
								onClick={handleStartEdit}
							>
								Редактировать
							</Button>
						</Space>
					)
				}
				style={{ margin: '16px 0' }}
			>
				{isEditMode ? (
					<AdvancedMarkdownEditor
						key={selectedNote.id}
					/>
				) : (
					<ReactMarkdown>{selectedNote.content}</ReactMarkdown>
				)}
				<div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
					<Text type="secondary">
						Символов: {selectedNote.content.length} | Слов: {selectedNote.content.split(/\s+/).filter(Boolean).length}
					</Text>
				</div>
			</Card>
		</div>
	);
};