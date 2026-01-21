import { Tabs, Typography, Button, Spin, message, Popconfirm, Input } from "antd";
import type { INote } from "./types";
import { useEffect, useState, useMemo, useRef } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelectedNote } from "../../../contexts/SelectedNote/hooks/useSelectedNote";
import { useEditMode } from "../../../contexts/EditMode/hooks/useEditMode";
import { useAuthContext } from "../../../contexts/AuthProvider/hooks/useAuthContext";
import { databaseService } from "../../../services/dataBaseService";

const { Text } = Typography;

export const SideBar = () => {
    const auth = useAuthContext();
    const { disableEditMode } = useEditMode();
    const [notes, setNotes] = useState<INote[]>([]);
    const [allNotes, setAllNotes] = useState<INote[]>([]);
    const [activeKey, setActiveKey] = useState<string>("");
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const { selectNote, selectedNote: contextSelectedNote } = useSelectedNote();
    
    const initialLoadRef = useRef<boolean>(true);
    const isSettingActiveNoteRef = useRef<boolean>(false);
    const prevNotesRef = useRef<INote[]>([]);

    const handleAddNote = async () => {
        if (!auth?.user) {
            message.warning("Для создания заметки войдите в систему");
            return;
        }

        try {
            const user = await databaseService.getUserByLogin(auth.user);

            if (!user) {
                message.error("Пользователь не найден");
                return;
            }

            const noteData = {
                title: "Новая заметка",
                content: "# Новая заметка\n\nНачните здесь...",
                userId: user.id
            };

            const noteId = await databaseService.createNote(noteData, user.id);

            selectNote({
                id: noteId,
                title: noteData.title,
                content: noteData.content,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            setActiveKey(noteId);

            message.success("Создана заметка");

        } catch (error) {
            console.error("Error creating note:", error);
            message.error("Ошибка при создании заметки");
        }
    };

    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) {
            return notes;
        }

        const query = searchQuery.toLowerCase().trim();
        return notes.filter(note => {
            const titleMatch = note.title?.toLowerCase().includes(query);
            const contentMatch = note.content?.toLowerCase().includes(query);
            return titleMatch || contentMatch;
        });
    }, [notes, searchQuery]);

    useEffect(() => {
        if (!auth?.user) {
            setNotes([]);
            setAllNotes([]);
            setActiveKey("");
            setLoading(false);
            initialLoadRef.current = true;
            prevNotesRef.current = [];
            return;
        }

        const loadUserNotes = async () => {
            try {
                setLoading(true);
                isSettingActiveNoteRef.current = true;

                const user = await databaseService.getUserByLogin(auth.user!);

                if (!user) {
                    message.warning("Пользователь не найден");
                    setNotes([]);
                    setAllNotes([]);
                    prevNotesRef.current = [];
                    setLoading(false);
                    isSettingActiveNoteRef.current = false;
                    return;
                }

                const userNotes = await databaseService.getUserNotes(user.id);

                const sortedNotes = userNotes.sort((a, b) =>
                    b.updatedAt.getTime() - a.updatedAt.getTime()
                );

                prevNotesRef.current = sortedNotes;
                
                setNotes(sortedNotes);
                setAllNotes(sortedNotes);

                if (sortedNotes.length > 0 && initialLoadRef.current) {
                    setActiveKey(sortedNotes[0].id);
                    selectNote(sortedNotes[0]);
                    initialLoadRef.current = false;
                } else if (sortedNotes.length > 0 && !activeKey) {
                    setActiveKey(sortedNotes[0].id);
                    selectNote(sortedNotes[0]);
                }

            } catch (error) {
                console.error("Error loading notes:", error);
                message.error("Ошибка при загрузке заметок");
                setNotes([]);
                setAllNotes([]);
                prevNotesRef.current = [];
            } finally {
                setLoading(false);
                setTimeout(() => {
                    isSettingActiveNoteRef.current = false;
                }, 100);
            }
        };

        loadUserNotes();
    }, [auth?.user]);

    useEffect(() => {
        if (!auth?.user) return;

        let unsubscribe: (() => void) | undefined;

        const setupRealtimeSubscription = async () => {
            try {
                const user = await databaseService.getUserByLogin(auth.user!);
                if (!user) return;

                unsubscribe = databaseService.subscribeToUserNotes(user.id, (updatedNotes) => {
                    const sortedNotes = updatedNotes.sort((a, b) =>
                        b.updatedAt.getTime() - a.updatedAt.getTime()
                    );
                    const prevNotes = prevNotesRef.current;
                    prevNotesRef.current = sortedNotes;
                    
                    setNotes(sortedNotes);
                    setAllNotes(sortedNotes);

                    const currentActiveKey = activeKey;
                    const currentContextSelectedNote = contextSelectedNote;

                    if (sortedNotes.some(note => note.id === currentActiveKey) &&
                        !isSettingActiveNoteRef.current &&
                        currentContextSelectedNote?.id === currentActiveKey) {
                        
                        const currentNote = sortedNotes.find(note => note.id === currentActiveKey);
                        if (currentNote) {
                            const prevNote = prevNotes.find(note => note.id === currentActiveKey);
                            if (!prevNote || 
                                prevNote.title !== currentNote.title || 
                                prevNote.content !== currentNote.content ||
                                prevNote.updatedAt.getTime() !== currentNote.updatedAt.getTime()) {
                                selectNote(currentNote);
                            }
                        }
                    } else if (sortedNotes.length > 0 && !currentActiveKey && !isSettingActiveNoteRef.current) {
                        setActiveKey(sortedNotes[0].id);
                        selectNote(sortedNotes[0]);
                    } else if (sortedNotes.length === 0) {
                        setActiveKey("");
                        prevNotesRef.current = [];
                    }
                });
            } catch (error) {
                console.error("Error setting up realtime subscription:", error);
            }
        };

        setupRealtimeSubscription();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [auth?.user]);

    useEffect(() => {
        if (contextSelectedNote && contextSelectedNote.id !== activeKey) {
            console.log("Контекст изменился, обновляем activeKey:", contextSelectedNote.id);
            setActiveKey(contextSelectedNote.id);
        }
    }, [contextSelectedNote, activeKey]);

    const handleChangeSelectedTab = (key: string) => {
        console.log("Пользователь выбрал вкладку:", key);
        const selectedNote = notes.find((note) => note.id === key);
        if (selectedNote) {
            isSettingActiveNoteRef.current = true;
            setActiveKey(key);
            selectNote(selectedNote);
            disableEditMode();
            setTimeout(() => {
                isSettingActiveNoteRef.current = false;
            }, 100);
        }
    };

    const toggleSidebar = () => {
        if (isAnimating) return;

        setIsAnimating(true);
        if (collapsed) {
            setCollapsed(false);
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        } else {
            setTimeout(() => {
                setCollapsed(true);
                setIsAnimating(false);
            }, 300);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const handleDeleteNote = async (noteId: string, e?: React.MouseEvent<HTMLElement>) => {
        if (e) {
            e.stopPropagation();
        }

        try {
            setDeleting(noteId);

            const user = await databaseService.getUserByLogin(auth!.user!);
            if (!user) {
                message.error("Пользователь не найден");
                return;
            }

            await databaseService.deleteNote(noteId, user.id);

            message.success("Заметка удалена");

            if (noteId === activeKey) {
                const remainingNotes = notes.filter(note => note.id !== noteId);
                if (remainingNotes.length > 0) {
                    const newActiveKey = remainingNotes[0].id;
                    console.log("Удалена активная заметка, выбираем новую:", newActiveKey);
                    isSettingActiveNoteRef.current = true;
                    setActiveKey(newActiveKey);
                    selectNote(remainingNotes[0]);

                    setTimeout(() => {
                        isSettingActiveNoteRef.current = false;
                    }, 100);
                } else {
                    console.log("Больше нет заметок");
                    setActiveKey("");
                }
            }

        } catch (error) {
            console.error("Error deleting note:", error);
            message.error("Ошибка при удалении заметки");
        } finally {
            setDeleting(null);
        }
    };

    const renderTabLabel = (note: INote) => {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "4px 0",
                minWidth: 0,
                opacity: collapsed ? 0 : 1,
                transition: "opacity 0.15s ease"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 2
                }}>
                    <Text strong style={{
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                        flex: 1
                    }}>
                        {note.title || "Без названия"}
                    </Text>

                    <Popconfirm
                        title="Удалить заметку?"
                        description="Вы уверены, что хотите удалить эту заметку? Это действие нельзя отменить."
                        onConfirm={(e) => handleDeleteNote(note.id, e)}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Да"
                        cancelText="Нет"
                        placement="leftTop"
                        overlayStyle={{ maxWidth: 250 }}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                            loading={deleting === note.id}
                            size="small"
                            style={{
                                width: 24,
                                height: 24,
                                padding: 0,
                                marginLeft: 4,
                                opacity: 0.6,
                                color: "#ff4d4f"
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        />
                    </Popconfirm>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 10
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#8c8c8c"
                    }}>
                        <span>{note.createdAt.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{
                width: "250px",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderRight: "1px solid #f0f0f0"
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!auth?.user) {
        return (
            <div style={{
                width: "250px",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
                borderRight: "1px solid #f0f0f0"
            }}>
                <Text type="secondary">Войдите для просмотра заметок</Text>
            </div>
        );
    }

    return (
        <div style={{ width: collapsed ? "20px" : "20%", transition: "width 0.3s ease-in-out" }}>
            <div
                style={{
                    height: "100vh",
                    width: collapsed ? "60px" : "0px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: "10px",
                    backgroundColor: "#fff",
                    borderRight: "1px solid #f0f0f0",
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 1000,
                    overflow: "hidden",
                    transition: "width 0.3s ease, opacity 0.3s ease",
                    opacity: collapsed ? 1 : 0
                }}
            >
                <Button
                    type="text"
                    icon={<MenuUnfoldOutlined />}
                    onClick={toggleSidebar}
                    style={{
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        backgroundColor: "#fff",
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        opacity: collapsed ? 1 : 0,
                        transition: "opacity 0.2s ease"
                    }}
                />
            </div>

            <div
                style={{
                    height: "100vh",
                    width: collapsed ? "0px" : "250px",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    borderRight: "1px solid #f0f0f0",
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 1001,
                    overflow: "hidden",
                    transition: "width 0.3s ease, transform 0.3s ease",
                    transform: collapsed ? "translateX(-250px)" : "translateX(0)",
                    boxShadow: collapsed ? "none" : "2px 0 8px rgba(0,0,0,0.1)"
                }}
            >
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px",
                    borderBottom: "1px solid #f0f0f0",
                    gap: "8px",
                    opacity: collapsed ? 0 : 1,
                    transition: "opacity 0.2s ease"
                }}>
                    <Button
                        type="text"
                        icon={<MenuFoldOutlined />}
                        onClick={toggleSidebar}
                        style={{
                            width: "32px",
                            height: "32px",
                            padding: 0,
                            flexShrink: 0
                        }}
                    />

                    <Input
                        placeholder="Поиск заметок..."
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear={{
                            clearIcon: searchQuery ? (
                                <Button
                                    type="text"
                                    size="small"
                                    onClick={clearSearch}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        padding: 0,
                                        fontSize: 10
                                    }}
                                >
                                    ×
                                </Button>
                            ) : undefined
                        }}
                        style={{
                            flex: 1,
                            fontSize: 12
                        }}
                        size="small"
                    />

                    <Button
                        icon={<PlusOutlined />}
                        onClick={handleAddNote}
                        style={{
                            width: "32px",
                            height: "32px",
                            padding: 0,
                            flexShrink: 0
                        }}
                    />
                </div>

                <div style={{
                    padding: "8px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    opacity: collapsed ? 0 : 1,
                    transition: "opacity 0.2s ease"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {searchQuery ? (
                                `Найдено: ${filteredNotes.length} из ${allNotes.length}`
                            ) : (
                                allNotes.length === 0
                                    ? "Нет заметок"
                                    : `Заметок: ${allNotes.length}`
                            )}
                        </Text>

                        {searchQuery && (
                            <Button
                                type="text"
                                size="small"
                                onClick={clearSearch}
                                style={{
                                    fontSize: 10,
                                    height: 20,
                                    padding: "0 4px"
                                }}
                            >
                                Сбросить
                            </Button>
                        )}
                    </div>
                </div>

                {allNotes.length === 0 ? (
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        opacity: collapsed ? 0 : 1,
                        transition: "opacity 0.2s ease"
                    }}>
                        <Text type="secondary" style={{ textAlign: "center" }}>
                            Создайте первую заметку
                        </Text>
                    </div>
                ) : filteredNotes.length === 0 && searchQuery ? (
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        opacity: collapsed ? 0 : 1,
                        transition: "opacity 0.2s ease"
                    }}>
                        <Text type="secondary" style={{ textAlign: "center" }}>
                            По запросу "{searchQuery}" ничего не найдено
                        </Text>
                    </div>
                ) : (
                    <Tabs
                        tabPosition="left"
                        activeKey={activeKey}
                        onChange={handleChangeSelectedTab}
                        style={{
                            flex: 1,
                            maxHeight: "calc(100vh - 100px)",
                            width: "100%",
                            opacity: collapsed ? 0 : 1,
                            transition: "opacity 0.2s ease"
                        }}
                        tabBarStyle={{
                            width: "100%",
                            marginRight: 0
                        }}
                        items={filteredNotes.map((note) => ({
                            label: renderTabLabel(note),
                            key: note.id,
                            children: null,
                            style: activeKey === note.id ? {
                                backgroundColor: "#f0f7ff",
                                borderRight: "3px solid #1890ff",
                                width: "100%",
                                opacity: collapsed ? 0 : 1,
                                transition: "opacity 0.2s ease"
                            } : {
                                width: "100%",
                                opacity: collapsed ? 0 : 1,
                                transition: "opacity 0.2s ease"
                            }
                        }))}
                    />
                )}
            </div>
        </div>
    );
};