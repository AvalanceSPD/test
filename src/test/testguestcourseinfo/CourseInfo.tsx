import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styles from './CourseInfo.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';  // แก้ไข path
import { Grid, Row, Col } from 'rsuite';
import { useWallet } from '@solana/wallet-adapter-react'; // เพิ่ม import

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
    // const [sessions, setSessions] = useState<Session[]>([]);
    // const [documents, setDocuments] = useState<Document[]>([]);
    // const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    // const [selectedSubSession, setSelectedSubSession] = useState<SubSession | null>(null);
    // const [lessonTitle, setLessonTitle] = useState('');
    // const [thumbnailUrl, setThumbnailUrl] = useState('');
    // const [videoUrl, setVideoUrl] = useState('');
    // const [description, setDescription] = useState('');
    // const [mainContent, setMainContent] = useState<MainContent>({});
    // const [isMainContent, setIsMainContent] = useState(true);
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

    const [userRole, setUserRole] = useState<'student' | 'instructor' | null>(null);
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const { publicKey } = useWallet(); // เพิ่ม useWallet hook
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isInStudentsList, setIsInStudentsList] = useState(false);
    const [studentListId, setStudentListId] = useState<string | null>(null);

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

    useEffect(() => {
        const checkUser = async () => {
          if (publicKey) {
            try {
              const { data, error } = await supabase
                .rpc('check_role_in_navebar', {
                  p_public_key:publicKey
                })
                if (error) console.error(error)
                else 
                  console.log(data)
                  console.log(data.wallet_address)
                // { data, error } = await supabase
                // .from('users')
                // .select('role')
                // .eq('wallet_address', publicKey.toString())
                // .single();
              
              if (error) {
                setIsRegistered(false);
                setUserRole(null);
              } if (data.is_instructor == true) {
                setIsRegistered(true);
                setUserRole('instructor');
              } if (data.is_student == true) {
                setIsRegistered(true);
                setUserRole('student');
              }
            } catch (error) {
              setIsRegistered(false);
              setUserRole(null);
            }
          } else {
            setIsRegistered(null);
            setUserRole(null);
          }
        };
    
        checkUser();
    }, [publicKey]);

    useEffect(() => {
        const checkEnrollmentStatus = async () => {
            if (!publicKey || !courseId) {
                console.log('Missing publicKey or courseId');
                return;
            }

            try {
                // 1. ดึง user id จาก wallet address
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('wallet_address', publicKey.toString())
                    .single();

                if (userError) {
                    console.log('Error getting user:', userError);
                    return;
                }

                // 2. ดึง student id จาก students_list
                const { data: studentData, error: studentError } = await supabase
                    .from('students_list')
                    .select('id')
                    .eq('std_id', userData.id)
                    .single();

                if (studentError) {
                    console.log('Error getting student:', studentError);
                    return;
                }

                console.log('Found student:', {
                    userId: userData.id,
                    studentId: studentData.id
                });

                // 3. เช็คการลงทะเบียนโดยใช้ student.id
                const { data: enrollmentData, error: enrollmentError } = await supabase
                    .from('enrolled_course')
                    .select('*')
                    .eq('std_id', studentData.id)
                    .eq('course_id', courseId);

                if (enrollmentError) {
                    console.error('Error checking enrollment:', enrollmentError);
                    return;
                }

                console.log('Enrollment check result:', {
                    studentId: studentData.id,
                    courseId: courseId,
                    enrollments: enrollmentData
                });

                // ถ้าพบข้อมูลการลงทะเบียน
                const isAlreadyEnrolled = enrollmentData && enrollmentData.length > 0;
                
                if (isAlreadyEnrolled) {
                    console.log(`Student ${studentData.id} is enrolled in course ${courseId}`);
                    setIsEnrolled(true);
                    setStudentListId(studentData.id);
                } else {
                    console.log(`Student ${studentData.id} is not enrolled in course ${courseId}`);
                    setIsEnrolled(false);
                    setStudentListId(studentData.id);
                }

            } catch (error) {
                console.error('Error in checkEnrollmentStatus:', error);
                setIsEnrolled(false);
            }
        };

        checkEnrollmentStatus();
    }, [publicKey, courseId]);

    useEffect(() => {
        const fetchStudentId = async () => {
            if (publicKey && userRole === 'student') {
                try {
                    // 1. ดึง id จากตาราง users ก่อน
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('wallet_address', publicKey.toString())
                        .single();

                    if (userError) {
                        console.error('Error fetching user:', userError);
                        setStudentListId(null);
                        setIsInStudentsList(false);
                        return;
                    }

                    console.log('User data:', userData);

                    // 2. ใช้ id จาก users ไปหาข้อมูลใน students_list
                    const { data: studentData, error: studentError } = await supabase
                        .from('students_list')
                        .select('id, std_id')
                        .eq('std_id', userData.id)
                        .single();

                    console.log('Student list query result:', { studentData, studentError });

                    if (studentError) {
                        console.error('Error fetching from students_list:', studentError);
                        setStudentListId(null);
                        setIsInStudentsList(false);
                        return;
                    }

                    if (studentData) {
                        console.log('Found student in list:', studentData);
                        setStudentListId(studentData.id);
                        setIsInStudentsList(true);
                    } else {
                        console.log('No student found in students_list');
                        setStudentListId(null);
                        setIsInStudentsList(false);
                    }
                } catch (error) {
                    console.error('Error in fetchStudentId:', error);
                    setStudentListId(null);
                    setIsInStudentsList(false);
                }
            } else {
                console.log('No wallet connected or user is not a student');
                setStudentListId(null);
                setIsInStudentsList(false);
            }
        };

        fetchStudentId();
    }, [publicKey, userRole]);

    // const handleSubSessionClick = (subSession: SubSession) => {
    //     setSelectedSubSession(subSession);
    //     setVideoUrl(subSession.videoUrl || '');
    //     setDescription(subSession.description || '');
    // };

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

    const handleEnroll = async () => {
        if (!studentListId || !courseId) {
            console.log('Missing studentListId or courseId');
            return;
        }

        try {
            // เช็คว่าลงทะเบียนไปแล้วหรือยัง
            const { data: existingEnrollment, error: checkError } = await supabase
                .from('enrolled_course')
                .select('*')
                .eq('course_id', courseId)
                .eq('std_id', studentListId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingEnrollment) {
                alert('คุณได้ลงทะเบียนในคอร์สนี้แล้ว');
                return;
            }

            // บันทึกการลงทะเบียน
            const { error: insertError } = await supabase
                .from('enrolled_course')
                .insert([
                    {
                        course_id: courseId,
                        std_id: studentListId
                    }
                ]);

            if (insertError) throw insertError;

            // อัพเดท state หลังลงทะเบียนสำเร็จ
            setIsEnrolled(true);
            alert('ลงทะเบียนสำเร็จ');

        } catch (err) {
            console.error('Error enrolling:', err);
            alert('เกิดข้อผิดพลาดในการลงทะเบียน');
        }
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
                            <Col xs={8} className={styles.thumbnailCol}>
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
                            <Col xs={16} className={styles.lessonTitleCol}>
                                <div className={styles.lessonTitle}>
                                    <h1>{course.title}</h1>
                                    <div className={styles.courseInfo}>
                                        <p>สร้างเมื่อ: {new Date(course.create_at).toLocaleDateString('th-TH')}</p>
                                        <p>อัปเดตล่าสุด: {new Date(course.update_at).toLocaleDateString('th-TH')}</p>
                                        <p>สร้างโดย: {course.create_by}</p>
                                    </div>
                                    <div className={styles.descriptionText}>
                                        {course.description}
                                        {userRole === 'student' && (
                                            <div className={styles.buttonContainer}>
                                                <button 
                                                    className={`${styles.enrollButton} ${isEnrolled ? styles.enrolled : ''}`}
                                                    onClick={handleEnroll}
                                                    disabled={isEnrolled}
                                                >
                                                    {isEnrolled ? 'Enrolled' : 'Enroll'}
                                                </button>
                                            </div>
                                        )}
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
                            <div className={
                                (!userRole || (userRole === 'student' && !isEnrolled)) 
                                ? styles.blurContainer 
                                : ''
                            }>
                                <iframe
                                    src={selectedVideoUrl}
                                    frameBorder="0"
                                    allowFullScreen
                                    className={styles.video}
                                />
                                {!userRole && (
                                    <div className={styles.blurOverlay}>
                                        <p>กรุณาเข้าสู่ระบบเพื่อรับชมวิดีโอ</p>
                                    </div>
                                )}
                                {userRole === 'student' && (
                                    <>
                                        {!isEnrolled ? (
                                            <div className={styles.blurOverlay}>
                                                {isInStudentsList ? (
                                                    <p>กรุณาลงทะเบียนเรียนเพื่อรับชมวิดีโอ</p>
                                                ) : (
                                                    <p>คุณไม่มีสิทธิ์ลงทะเบียนเรียนในรายวิชานี้</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>คุณได้ลงทะเบียนเรียนแล้ว</div>
                                        )}
                                    </>
                                )}
                            </div>
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