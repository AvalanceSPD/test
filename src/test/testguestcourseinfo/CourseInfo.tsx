import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styles from './CourseInfo.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';  // แก้ไข path
import { Grid, Row, Col } from 'rsuite';

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    create_at: string;
    update_at: string;
    create_by: string;
}

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

interface Lesson {
    id: number;
    title: string;
    media: string;
    description: string;
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


// กำหนด root element สำหรับ Modal
Modal.setAppElement('#root'); // หรือ element ที่เป็น root ของแอพ

const CourseInfo = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedSubSession, setSelectedSubSession] = useState<SubSession | null>(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [description, setDescription] = useState('');
    const [mainContent, setMainContent] = useState<MainContent>({});
    const [isMainContent, setIsMainContent] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
    const [selectedDescription, setSelectedDescription] = useState<string>('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

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

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                
                // ตรวจสอบว่ามี courseId หรือไม่
                if (!courseId) {
                    throw new Error('ไม่พบรหัสบทเรียน');
                }

                // แปลง courseId เป็นตัวเลข
                const numericCourseId = parseInt(courseId);
                
                // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้องหรือไม่
                if (isNaN(numericCourseId) || numericCourseId <= 0) {
                    throw new Error('รหัสบทเรียนไม่ถูกต้อง');
                }

                const { data, error } = await supabase
                    .from('course')
                    .select('*')
                    .eq('id', numericCourseId)
                    .single();

                if (error) {
                    throw error;
                }

                if (!data) {
                    throw new Error('ไม่พบข้อมูลบทเรียน');
                }

                setCourse(data);

                // ดึงข้อมูล lessons
                const { data: lessonData, error: lessonError } = await supabase
                    .from('lesson')
                    .select('*')
                    .eq('course_id', numericCourseId)
                    .order('id', { ascending: true });

                if (lessonError) throw lessonError;
                setLessons(lessonData || []);

                console.log('Lesson Data:', lessonData); // ตรวจสอบข้อมูลที่ดึงมา

                if (lessonData && lessonData.length > 0) {
                    const firstLesson = lessonData[0];
                    const videoId = firstLesson.media.split('v=')[1].split('&')[0];
                    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    setSelectedVideoUrl(embedUrl);
                    setSelectedDescription(firstLesson.description);
                    setSelectedTitle(firstLesson.title);
                } else {
                    console.log('No lessons found for this course.'); // แจ้งเมื่อไม่มีบทเรียน
                }

            } catch (err: any) {
                console.error('Error fetching course:', err);
                setError(err.message || 'ไม่สามารถโหลดข้อมูลบทเรียนได้');
                // ถ้าไม่พบบทเรียนหรือ ID ไม่ถูกต้อง ให้กลับไปหน้าหลัก
                if (err.message.includes('ไม่พบ') || err.message.includes('ไม่ถูกต้อง')) {
                    navigate('/'); // หรือหน้าอื่นที่เหมาะสม
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, navigate]);

    useEffect(() => {
        if (lessons.length > 0) {
            const firstLesson = lessons[0]; // ดึงข้อมูลจากบทเรียนแรก
            const videoId = firstLesson.media.split('v=')[1].split('&')[0]; // ดึง video ID
            const embedUrl = `https://www.youtube.com/embed/${videoId}`; // สร้าง embed URL
            setSelectedVideoUrl(embedUrl); // ตั้งค่า embed URL
            setSelectedDescription(firstLesson.description); // ตั้งค่าคำอธิบาย
            setSelectedTitle(firstLesson.title); // ตั้งค่าชื่อ
        }
    }, [lessons]);

    const handleSubSessionClick = (subSession: SubSession) => {
        setSelectedSubSession(subSession);
        setVideoUrl(subSession.videoUrl || '');
        setDescription(subSession.description || '');
    };

    const handleVideoClick = (media: string, title: string, description: string) => {
        const videoId = media.split('v=')[1].split('&')[0]; // ดึง video ID
        const embedUrl = `https://www.youtube.com/embed/${videoId}`; // สร้าง embed URL
        setSelectedVideoUrl(embedUrl); // ตั้งค่า embed URL
        setSelectedDescription(description); // ตั้งค่าคำอธิบาย
        setSelectedTitle(title); // ตั้งค่าชื่อ
    };

    const toggleLesson = (index: number) => {
        setExpandedLesson(expandedLesson === index ? null : index);
    };

    if (loading) {
        return <div className={styles.loadingState}>กำลังโหลด...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>{error}</div>;
    }

    if (!course) {
        return <div className={styles.errorState}>ไม่พบบทเรียนที่ต้องการ</div>;
    }

    return (
        <Grid fluid>
            <Row className={styles.header}>
                <Col xs={24}>
                    <div className={styles.headerBox}>
                        <Row>
                            <Col xs={4} className={styles.thumbnailCol}>
                                <div className={styles.thumbnailContainer}>
                                    {course.thumbnail && (
                                        <img 
                                            src={course.thumbnail} 
                                            alt={`${course.title} thumbnail`} 
                                            className={styles.thumbnail}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    )}
                                </div>
                            </Col>
                            <Col xs={20} className={styles.lessonTitleCol}>
                                <div className={styles.lessonTitle}>
                                    <h1>{course.title}</h1>
                                    <div className={styles.courseInfo}>
                                        <p>สร้างเมื่อ: {new Date(course.create_at).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}</p>
                                        <p>อัปเดตล่าสุด: {new Date(course.update_at).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}</p>
                                        <p>สร้างโดย: {course.create_by}</p>
                                    </div>
                                    <div className={styles.descriptionText}>
                                        {course.description}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            <Row className={styles.contentRow}>
                <Col xs={16} className={styles.mainContentCol}>
                    <div className={styles.videoContainer}>
                        {selectedVideoUrl ? (
                            <iframe
                                src={selectedVideoUrl}
                                frameBorder="0"
                                allowFullScreen
                                className={styles.video}
                            />
                        ) : (
                            <p>ไม่มีวิดีโอให้แสดง</p>
                        )}

                    </div>
                    <div className={styles.lessonList}>
                        <div className={styles.descriptionText}>
                                <h2>{selectedTitle}</h2>
                                <p>{selectedDescription || 'ไม่มีคำอธิบาย'}</p>
                        </div>
                    </div>
                </Col>

                <Col xs={8} className={styles.sidebarCol}>
                    <div className={styles.rightSection}>
                    <h3>Contents</h3>
                        {lessons.map((lesson, index) => (
                            <div key={lesson.id} className={styles.lessonContainer}>
                                <h4 
                                    className={styles.lessonTitle} 
                                    onClick={() => toggleLesson(index)} // เปิด/ปิด dropdown
                                >
                                    {lesson.title} {expandedLesson === index ? '▲' : '▼'}
                                </h4>
                                {expandedLesson === index && (
                                    <div className={styles.lessonContent}>
                                        <div 
                                            onClick={() => handleVideoClick(lesson.media, lesson.title, lesson.description)} 
                                            className={styles.contentLink}
                                        >
                                            ดูวิดีโอ
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>
        </Grid>
    );
};

export default CourseInfo;