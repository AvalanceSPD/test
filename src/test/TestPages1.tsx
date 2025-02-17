import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styles from './TestPages1.module.css';

interface Session {
  id: number;
  title: string;
  subSessions: SubSession[];
}

interface SubSession {
  id: number;
  title: string;
  videoUrl?: string;
  description?: string;
}

interface Document {
  id: number;
  title: string;
  file?: File;
  url?: string;
}

interface Quiz {
  id: number;
  title: string;
}

interface MainContent {
  previewVideo?: string;
  mainDescription?: string;
}

// เพิ่ม interface สำหรับ Modal
interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder: string;
}

// สร้าง Component Modal แยก
const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit, title, placeholder }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.modalContent}>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={styles.modalInput}
            autoFocus
          />
          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              ยกเลิก
            </button>
            <button type="submit" className={styles.submitButton}>
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// เพิ่ม interface สำหรับ URL Modal
interface UrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; url: string }) => void;
  title: string;
}

// สร้าง Component Modal สำหรับ URL
const UrlModal: React.FC<UrlModalProps> = ({ isOpen, onClose, onSubmit, title }) => {
  const [inputTitle, setInputTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTitle.trim() && url.trim()) {
      onSubmit({ title: inputTitle, url });
      setInputTitle('');
      setUrl('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.modalContent}>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalField}>
            <label>ชื่อ</label>
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="กรุณาใส่ชื่อ"
              className={styles.modalInput}
              autoFocus
            />
          </div>
          <div className={styles.modalField}>
            <label>URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="กรุณาใส่ URL"
              className={styles.modalInput}
            />
          </div>
          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!inputTitle.trim() || !url.trim()}
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// กำหนด root element สำหรับ Modal
Modal.setAppElement('#root'); // หรือ element ที่เป็น root ของแอพ

const TestPages = () => {
    const [lessonTitle, setLessonTitle] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [selectedSubSessionId, setSelectedSubSessionId] = useState<number | null>(null);
    const [selectedSubSession, setSelectedSubSession] = useState<SubSession | null>(null);
    const [description, setDescription] = useState('');
    const [mainContent, setMainContent] = useState<MainContent>({});
    const [isMainContent, setIsMainContent] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        placeholder: '',
        onSubmit: (value: string) => {},
    });

    // เพิ่ม state สำหรับ URL Modal
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [urlModalConfig, setUrlModalConfig] = useState({
        title: '',
        onSubmit: (data: { title: string; url: string }) => {},
    });

    // ฟังก์ชันจัดการรูปภาพปก
    const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setThumbnailUrl(url);
        }
    };

    // ฟังก์ชันเปิด Modal สำหรับเพิ่ม URL
    const openUrlModal = (type: 'video' | 'document', sessionId?: number) => {
        setUrlModalConfig({
            title: type === 'video' ? 'เพิ่มวิดีโอ' : 'เพิ่มเอกสาร',
            onSubmit: (data) => {
                if (type === 'video' && sessionId) {
                    setSessions(sessions.map(session => {
                        if (session.id === sessionId) {
                            return {
                                ...session,
                                subSessions: [...session.subSessions, {
                                    id: Date.now(),
                                    title: data.title,
                                    videoUrl: data.url
                                }]
                            };
                        }
                        return session;
                    }));
                } else if (type === 'document') {
                    setDocuments([...documents, {
                        id: Date.now(),
                        title: data.title,
                        url: data.url
                    }]);
                }
            }
        });
        setIsUrlModalOpen(true);
    };

    // ฟังก์ชันเปิด Modal สำหรับการเพิ่ม Session
    const openAddSessionModal = () => {
        setModalConfig({
            title: 'เพิ่มบทเรียนใหม่',
            placeholder: 'ชื่อบทเรียน',
            onSubmit: (title) => {
                setSessions([...sessions, {
                    id: Date.now(),
                    title,
                    subSessions: []
                }]);
            }
        });
        setIsModalOpen(true);
    };

    // ฟังก์ชันเปิด Modal สำหรับการเพิ่ม SubSession
    const openAddSubSessionModal = (sessionId: number) => {
        setModalConfig({
            title: 'เพิ่มบทเรียนย่อย',
            placeholder: 'ชื่อบทเรียนย่อย',
            onSubmit: (title) => {
                setSessions(sessions.map(session => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            subSessions: [...session.subSessions, {
                                id: Date.now(),
                                title
                            }]
                        };
                    }
                    return session;
                }));
            }
        });
        setIsModalOpen(true);
    };

    // ฟังก์ชันเปิด Modal สำหรับการเพิ่ม Quiz
    const openAddQuizModal = () => {
        setModalConfig({
            title: 'เพิ่มแบบทดสอบ',
            placeholder: 'ชื่อแบบทดสอบ',
            onSubmit: (title) => {
                setQuizzes([...quizzes, {
                    id: Date.now(),
                    title
                }]);
            }
        });
        setIsModalOpen(true);
    };

    // ฟังก์ชันจัดการการคลิกที่บทเรียนย่อย
    const handleSubSessionClick = (subSession: SubSession) => {
        setSelectedSubSession(subSession);
        setVideoUrl(subSession.videoUrl || '');
        setDescription(subSession.description || '');
    };

    // ฟังก์ชันบันทึกข้อมูลวิดีโอและคำอธิบาย
    const handleSaveSubSessionContent = () => {
        if (selectedSubSession) {
            setSessions(sessions.map(session => ({
                ...session,
                subSessions: session.subSessions.map(subSession => 
                    subSession.id === selectedSubSession.id
                        ? { ...subSession, videoUrl, description }
                        : subSession
                )
            })));
        }
    };

    // ฟังก์ชันจัดการการลบ
    const handleDeleteSession = (sessionId: number) => {
        setSessions(sessions.filter(session => session.id !== sessionId));
    };

    const handleDeleteSubSession = (sessionId: number, subSessionId: number) => {
        setSessions(sessions.map(session => {
            if (session.id === sessionId) {
                return {
                    ...session,
                    subSessions: session.subSessions.filter(sub => sub.id !== subSessionId)
                };
            }
            return session;
        }));
    };

    const handleDeleteDocument = (documentId: number) => {
        setDocuments(documents.filter(doc => doc.id !== documentId));
    };

    const handleDeleteQuiz = (quizId: number) => {
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    };

    // ฟังก์ชันจัดการวิดีโอพรีวิว
    const handleMainVideoClick = () => {
        setUrlModalConfig({
            title: 'เพิ่มวิดีโอพรีวิว',
            onSubmit: (data) => {
                setMainContent({
                    ...mainContent,
                    previewVideo: data.url
                });
            }
        });
        setIsUrlModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.thumbnailContainer}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            id="thumbnail-upload"
                            className={styles.fileInput}
                        />
                        <label htmlFor="thumbnail-upload" className={styles.uploadLabel}>
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Upload Thumbnail</span>
                                </div>
                            )}
                        </label>
                    </div>
                    <div className={styles.lessonTitle}>
                        <input
                            type="text"
                            placeholder="Lesson name"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            className={styles.titleInput}
                            />
                        <textarea
                            placeholder="Lesson description"
                            value={mainContent.mainDescription || ''}
                            onChange={(e) => setMainContent({
                                ...mainContent,
                                mainDescription: e.target.value
                            })}
                            className={styles.headerDescription}
                            />
                            <div className={styles.bigblock}>bigblock
                            <div className={styles.block1}>block1</div>
                            <div className={styles.block2}>block2</div>
                            </div>
                    </div>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.leftSection}>
                    {/* ปุ่มสลับระหว่างเนื้อหาหลักและบทเรียนย่อย */}
                    <div className={styles.contentToggle}>
                        <button 
                            className={`${styles.toggleButton} ${isMainContent ? styles.active : ''}`}
                            onClick={() => setIsMainContent(true)}
                        >
                            เนื้อหาหลัก
                        </button>
                        <button 
                            className={`${styles.toggleButton} ${!isMainContent ? styles.active : ''}`}
                            onClick={() => setIsMainContent(false)}
                        >
                            บทเรียนย่อย
                        </button>
                    </div>

                    {isMainContent ? (
                        // เนื้อหาหลัก
                        <>
                            <div className={styles.videoContainer} onClick={handleMainVideoClick}>
                                {mainContent.previewVideo ? (
                                    <iframe
                                        src={mainContent.previewVideo}
                                        frameBorder="0"
                                        allowFullScreen
                                        className={styles.video}
                                    />
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        + Add Preview Video
                                    </div>
                                )}
                            </div>
                            <textarea
                                value={mainContent.mainDescription || ''}
                                onChange={(e) => setMainContent({
                                    ...mainContent,
                                    mainDescription: e.target.value
                                })}
                                placeholder="Add main description..."
                                className={styles.descriptionInput}
                            />
                            <button 
                                onClick={() => {/* บันทึกเนื้อหาหลัก */}}
                                className={styles.saveButton}
                            >
                                บันทึกเนื้อหาหลัก
                            </button>
                        </>
                    ) : (
                        // เนื้อหาบทเรียนย่อย
                        <>
                            <div className={styles.videoContainer} onClick={() => selectedSubSession && setIsUrlModalOpen(true)}>
                                {videoUrl ? (
                                    <iframe
                                        src={videoUrl}
                                        frameBorder="0"
                                        allowFullScreen
                                        className={styles.video}
                                    />
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        {selectedSubSession ? '+ Add Video URL' : 'เลือกบทเรียนย่อยเพื่อเพิ่มวิดีโอ'}
                                    </div>
                                )}
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={selectedSubSession ? "Add description..." : "เลือกบทเรียนย่อยเพื่อเพิ่มคำอธิบาย"}
                                className={styles.descriptionInput}
                                disabled={!selectedSubSession}
                            />
                            {selectedSubSession && (
                                <button 
                                    onClick={handleSaveSubSessionContent}
                                    className={styles.saveButton}
                                >
                                    บันทึกการเปลี่ยนแปลง
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.rightSection}>
                    <h3>Navigate</h3>
                    
                    {/* Session Section */}
                    <div className={styles.navigationSection}>
                        <div className={styles.sectionHeader}>
                            <h4>Session</h4>
                            <button onClick={openAddSessionModal}>+ Add Session</button>
                        </div>
                        {sessions.map(session => (
                            <div key={session.id} className={styles.sessionItem}>
                                <div className={styles.sessionHeader}>
                                    <span>{session.title}</span>
                                    <div className={styles.sessionActions}>
                                        <button 
                                            onClick={() => openAddSubSessionModal(session.id)}
                                            className={styles.actionButton}
                                        >
                                            +
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSession(session.id)}
                                            className={styles.deleteButton}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.subSessionList}>
                                    {session.subSessions.map(subSession => (
                                        <div 
                                            key={subSession.id} 
                                            className={`${styles.subSessionItem} ${selectedSubSession?.id === subSession.id ? styles.selected : ''}`}
                                            onClick={() => {
                                                handleSubSessionClick(subSession);
                                                setIsMainContent(false);
                                            }}
                                        >
                                            <span>{subSession.title}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSubSession(session.id, subSession.id);
                                                }}
                                                className={styles.deleteButton}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Document Section */}
                    <div className={styles.navigationSection}>
                        <div className={styles.sectionHeader}>
                            <h4>Document</h4>
                            <button onClick={() => openUrlModal('document')}>+ Add Document</button>
                        </div>
                        {documents.map(doc => (
                            <div key={doc.id} className={styles.documentItem}>
                                <span>{doc.title}</span>
                                <button 
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className={styles.deleteButton}
                                >×</button>
                            </div>
                        ))}
                    </div>

                    {/* Quiz Section */}
                    <div className={styles.navigationSection}>
                        <div className={styles.sectionHeader}>
                            <h4>Quiz</h4>
                            <button onClick={openAddQuizModal}>+ Add Quiz</button>
                        </div>
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className={styles.quizItem}>
                                <span>{quiz.title}</span>
                                <button 
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className={styles.deleteButton}
                                >×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* URL Modal */}
            <UrlModal
                isOpen={isUrlModalOpen}
                onClose={() => setIsUrlModalOpen(false)}
                onSubmit={urlModalConfig.onSubmit}
                title={urlModalConfig.title}
            />

            {/* Input Modal */}
            <InputModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={modalConfig.onSubmit}
                title={modalConfig.title}
                placeholder={modalConfig.placeholder}
            />
        </div>
    );
};

export default TestPages;