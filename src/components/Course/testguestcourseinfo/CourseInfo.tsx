import React, { use, useEffect, useState } from 'react';
import Modal from 'react-modal';
import styles from './CourseInfo.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabaseClient';  // แก้ไข path
import { Grid, Row, Col } from 'rsuite';
import { useWallet } from '@solana/wallet-adapter-react'; // เพิ่ม import
import Swal from 'sweetalert2';


interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    create_at: string;
    update_at: string;
    create_by: string;
}

interface Lesson {
    id: number;
    title: string;
    media: string;
    description: string;
    file?: string;
    hasQuiz: boolean;
}

interface profiledata {
    wallet_address: string,
    username: string,
    ins_name: string,
    is_instructor: boolean,
    is_student: boolean
  }

// เพิ่ม interface สำหรับ Modal
interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder: string;
}

interface Quiz {
    id: number;
    question: string;
    media: null;
    created_at: string;
    opts1: string;
    opts2: string;
    opts3: string;
    answer: string;
    lesson_id: number;
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [quiz, setQuiz] = useState<Quiz[]>([]);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
    const [selectedDescription, setSelectedDescription] = useState<string>('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
    const [instructorName, setInstructorName] = useState<string | null>(null);
    const [profiledata, setProfiledata] = useState<profiledata | null>(null);
    const [showvideo, setShowvideo] = useState(true);
    const [showquiz, setShowquiz] = useState(false);

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
    // เพิ่ม state สำหรับเก็บข้อมูลเอกสาร
    const [lessonDocument, setLessonDocument] = useState<string | null>(null);
    
    // เพิ่ม state เก็บข้อมูลว่า lesson ไหนมี quiz บ้าง
    const [lessonsWithQuiz, setLessonsWithQuiz] = useState<number[]>([]);

    // เพิ่ม state สำหรับเก็บคำตอบ
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

    const [currentQuizIndex, setCurrentQuizIndex] = useState(0); // ติดตาม quiz ปัจจุบัน

    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]); // เก็บตัวเลือกที่สุ่ม

    const [score, setScore] = useState(0); // ตัวแปรสำหรับเก็บคะแนน
    const [quizCompleted, setQuizCompleted] = useState(false); // ตัวแปรสำหรับตรวจสอบว่า quiz เสร็จสิ้นหรือไม่

    const [quizzes, setQuizzes] = useState<any[]>([]); // เก็บข้อมูล quiz

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

                // console.log('Lesson Data:', lessonData); // ตรวจสอบข้อมูลที่ดึงมา

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

            // ดึงชื่อผู้สอน
            const fetchInstructorName = async () => {
                if (data && data.create_by) {
                    const { data: instructorData, error: instructorError } = await supabase
                        .from('instructors_list')
                        .select('ins_name')
                        .eq('id', data.create_by)
                        .single();

                    if (instructorError) {
                        console.error('Error fetching instructor name:', instructorError);
                    } else {
                        setInstructorName(instructorData?.ins_name);
                    }
                }
            };

            await fetchInstructorName();

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

    useEffect(() => {
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
                //   console.log(data)
                //   console.log(data.wallet_address)
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
              } if (data) {
                setProfiledata(data);
      
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
                // console.log('Missing publicKey or courseId');
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

                // console.log('Found student:', {
                //     userId: userData.id,
                //     studentId: studentData.id
                // });

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

                // console.log('Enrollment check result:', {
                //     studentId: studentData.id,
                //     courseId: courseId,
                //     enrollments: enrollmentData
                // });

                // ถ้าพบข้อมูลการลงทะเบียน
                const isAlreadyEnrolled = enrollmentData && enrollmentData.length > 0;
                
                if (isAlreadyEnrolled) {
                    // console.log(`Student ${studentData.id} is enrolled in course ${courseId}`);
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

                    // console.log('User data:', userData);

                    // 2. ใช้ id จาก users ไปหาข้อมูลใน students_list
                    const { data: studentData, error: studentError } = await supabase
                        .from('students_list')
                        .select('id, std_id')
                        .eq('std_id', userData.id)
                        .single();

                    // console.log('Student list query result:', { studentData, studentError });

                    if (studentError) {
                        console.error('Error fetching from students_list:', studentError);
                        setStudentListId(null);
                        setIsInStudentsList(false);
                        return;
                    }

                    if (studentData) {
                        // console.log('Found student in list:', studentData);
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
                // console.log('No wallet connected or user is not a student');
                setStudentListId(null);
                setIsInStudentsList(false);
            }
        };

        fetchStudentId();
    }, [publicKey, userRole]);

    useEffect(() => {
        
    }, [courseId]);

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
        setShowvideo(true);
        setShowquiz(false);
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
            console.log('Checking enrollment...'); // เพิ่ม log
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
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'You are already enrolled in this course.',
                });
                return;
            }

            const { error: insertError } = await supabase
                .from('enrolled_course')
                .insert([{ course_id: courseId, std_id: studentListId }]);

            if (insertError) throw insertError;

            setIsEnrolled(true);
            console.log('Enrollment successful');
            Swal.fire({
                icon: 'success',
                title: 'Enrollment successful',
                text: 'You have successfully enrolled in the course!',
            });

            await fetchCourseData();

        } catch (err) {
            console.error('Error enrolling:', err);
            alert('An error occurred during enrollment');
        }
    };

    const handleCancelEnrollment = async () => {
        if (!studentListId || !courseId) {
            console.log('Missing studentListId or courseId');
            return;
        }

        // แสดง pop-up ยืนยันการยกเลิกการลงทะเบียน
        const result = await Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
        });

        if (result.isConfirmed) {
            try {
                console.log('Attempting to delete enrollment...');
                const { error } = await supabase
                    .from('enrolled_course')
                    .delete()
                    .eq('course_id', courseId)
                    .eq('std_id', studentListId);

                if (error) throw error;

                setIsEnrolled(false);
                console.log('Enrollment canceled successfully');
                Swal.fire(
                    'Canceled!',
                    'Your enrollment has been canceled.',
                    'success'
                );

                await fetchCourseData();

            } catch (err) {
                console.error('Error canceling enrollment:', err);
                Swal.fire(
                    'Error!',
                    'An error occurred while canceling enrollment.',
                    'error'
                );
            }
        }
    };


    // useEffect(() => {
        
    // }, [courseId, navigate]);

    const handleQuizClick = async (lessonId: number) => {
        setShowvideo(false);
        setShowquiz(true);
        
        try {
            const { data, error } = await supabase
                .from('quiz')
                .select('*')
                .eq('lesson_id', lessonId);

            if (error) {
                console.error('Error fetching quizzes:', error);
                return;
            }

            setQuiz(data || []);
            setSelectedAnswers({}); // รีเซ็ตคำตอบ
            setCurrentQuizIndex(0); // รีเซ็ต index เมื่อโหลด quiz ใหม่
            
        } catch (err) {
            console.error('Error:', err);
        }
    };

    // ฟังก์ชันสำหรับสุ่มตำแหน่งตัวเลือก
    const shuffleOptions = (options: string[]) => {
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options;
    };

    // เพิ่มฟังก์ชันตรวจสอบ quiz ในแต่ละ lesson
    useEffect(() => {
        const checkQuizzes = async () => {
            try {
                const { data, error } = await supabase
                    .from('quiz')
                    .select('lesson_id');
                
                if (error) throw error;
                
                // เก็บ lesson_id ที่มี quiz
                const lessonIds = [...new Set(data.map(q => q.lesson_id))];
                setLessonsWithQuiz(lessonIds);
            } catch (err) {
                console.error('Error checking quizzes:', err);
            }
        };

        checkQuizzes();
    }, []);

    // ฟังก์ชันสำหรับไปยัง quiz ถัดไป
    const nextQuiz = () => {
        if (currentQuizIndex < quiz.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
        }
    };

    // ฟังก์ชันสำหรับย้อนกลับไปยัง quiz ก่อนหน้า
    const previousQuiz = () => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(currentQuizIndex - 1);
        }
    };

    // ใช้ useEffect เพื่อติดตามการเปลี่ยนแปลงของ currentQuizIndex
    useEffect(() => {
        if (quiz.length > 0) {
            const options = [
                quiz[currentQuizIndex].opts1,
                quiz[currentQuizIndex].opts2,
                quiz[currentQuizIndex].opts3,
                quiz[currentQuizIndex].answer // รวมคำตอบในตัวเลือก
            ];
            setShuffledOptions(shuffleOptions(options)); // สุ่มตัวเลือกสำหรับ quiz ปัจจุบัน
        }
    }, [currentQuizIndex, quiz]);

    const handleQuizCompletion = () => {
        let totalScore = 0;

        quiz.forEach((question) => {
            if (selectedAnswers[question.id] === question.answer) {
                totalScore += 1; // เพิ่มคะแนนเมื่อคำตอบถูกต้อง
            }
        });

        setScore(totalScore); // บันทึกคะแนน
        setQuizCompleted(true); // ตั้งค่าให้ quiz เสร็จสิ้น

        // แสดงคะแนนใน SweetAlert
        Swal.fire({
            title: 'Quiz Completed!',
            text: `Your score is ${totalScore} out of ${quiz.length}`,
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            console.log('Score:', totalScore); // แสดงคะแนนใน console
        });
    };

    // ปุ่มสำหรับส่งคำตอบเมื่อเสร็จสิ้น quiz
    const handleSubmitQuiz = () => {
        handleQuizCompletion();
    };

    const isUserAllowed = () => {
        // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
        if (!publicKey) return false;
        // ตรวจสอบว่าผู้ใช้เป็น instructor หรือ enroll ในบทเรียนนั้น
        return isEnrolled; // สมมติว่า isEnrolled เป็น state ที่เก็บสถานะ
    };

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const { data, error } = await supabase
                    .from('quiz')
                    .select('*');

                if (error) {
                    console.error('Error fetching quizzes:', error);
                    return;
                }

                setQuizzes(data || []); // เก็บข้อมูล quiz
            } catch (err) {
                console.error('Error:', err);
            }
        };

        fetchQuizzes();
    }, []);

    if (loading) {
        return <div className={styles.loadingState}>loading...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>{error}</div>;
    }

    if (!course) {
        return <div className={styles.errorState}>The required course was not found.</div>;
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
                                        <p>Create at: {new Date(course.create_at).toLocaleDateString('th-TH')}</p>
                                        <p>Update at: {new Date(course.update_at).toLocaleDateString('th-TH')}</p>
                                        <p>Create by: {instructorName || 'Loading...'}</p>
                                    </div>
                                    <div className={styles.descriptionText}>
                                        {course.description}
                                        <div className={styles.buttonContainer}>
                                            {userRole !== 'instructor' && !isEnrolled ? (
                                                <button 
                                                    className={styles.enrollButton}
                                                    onClick={handleEnroll}
                                                >
                                                    Enroll
                                                </button>
                                            ) : isEnrolled ? (
                                                <button 
                                                    className={styles.cancelButton}
                                                    onClick={handleCancelEnrollment}
                                                >
                                                    Cancel Enrollment
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            <Row className={styles.contentRow}>
                <Col xs={16} className={styles.mainContentCol}>
                    {showvideo && (
                    <div className={styles.videoContainer}>
                        {selectedVideoUrl  && ( //: edit to check  both showvideo & selectedVideoUrl
                            <div className={
                                (!userRole || (userRole === 'student' && !isEnrolled) || 
                                (userRole === 'instructor' && instructorName !== profiledata?.ins_name)) 
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
                                        <p>Please log in to watch the video.</p>
                                    </div>
                                )}
                                {userRole === 'instructor' && instructorName !== profiledata?.ins_name && (
                                    <div className={styles.blurOverlay}>
                                        <p>You are not the owner of this course.</p>
                                    </div>
                                )}
                                {userRole === 'student' && (
                                    <>
                                        {!isEnrolled ? (
                                            <div className={styles.blurOverlay}>
                                                {isInStudentsList ? (
                                                    <p>Please enroll to watch the video.</p>
                                                ) : (
                                                    <p>You are not eligible to enroll for this course.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>You have already enrolled for course.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        {!selectedVideoUrl && ( //: edit to have no selectedVideoUrl
                            <p>There are no videos to show.</p>
                    )}
                </div>)}
                    {selectedVideoUrl && showvideo && ( //: edit show when 
                        <div className={styles.lessonList}>
                            <div className={styles.descriptionText}>
                                    <h2>{selectedTitle}</h2>
                                    <p>{selectedDescription || 'No description'}</p>
                            </div>
                        </div>
                    )}
                    {showquiz && quiz.length > 0 && (
                        <div className={styles.quizContainer}>
                            <div key={quiz[currentQuizIndex].id}>
                                <div>
                                    <h1 className={styles.questionTitle}>Question {currentQuizIndex + 1}</h1>
                                </div>
                                <div>
                                    <h3>{quiz[currentQuizIndex].question}</h3>
                                </div>
                                <div>
                                    <h3>Select an option:</h3>
                                    {shuffledOptions.map((option, optionIndex) => (
                                        <div key={optionIndex}>
                                            <label className={`${styles.optionLabel} ${selectedAnswers[quiz[currentQuizIndex].id] === option ? styles.selectedOption : ''}`}>
                                                <input
                                                    type="radio"
                                                    value={option}
                                                    name={`question-${quiz[currentQuizIndex].id}`}
                                                    checked={selectedAnswers[quiz[currentQuizIndex].id] === option}
                                                    onChange={(e) => setSelectedAnswers({
                                                        ...selectedAnswers,
                                                        [quiz[currentQuizIndex].id]: e.target.value
                                                    })}
                                                />
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.buttonContainer}>
                                <button className={styles.quizButton} onClick={previousQuiz} disabled={currentQuizIndex === 0}>
                                    Previous
                                </button>
                                <button className={styles.quizButton} onClick={nextQuiz} disabled={currentQuizIndex === quiz.length - 1}>
                                    Next
                                </button>
                                {currentQuizIndex === quiz.length - 1 && (
                                    <button className={styles.quizButton} onClick={handleSubmitQuiz}>
                                        Submit Quiz
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Col>

                <Col xs={8} className={styles.sidebarCol}>
                    <div className={styles.rightSection}>
                    <h3>Contents</h3>
                        {lessons.map((lesson, index) => (
                            <div key={lesson.id} className={styles.lessonContainer}>
                                <h4 
                                    className={styles.lessonTitle} 
                                    onClick={() => toggleLesson(index)}
                                >
                                    {lesson.title} {expandedLesson === index ? '▲' : '▼'}
                                </h4>
                                {expandedLesson === index && (
                                    <div className={styles.lessonContent}>
                                        <div 
                                            onClick={() => {
                                                if (isUserAllowed()) {
                                                    handleVideoClick(lesson.media, lesson.title, lesson.description);
                                                } else {
                                                    Swal.fire('You must be enrolled or logged in to access this document.');
                                                }
                                            }} 
                                            className={styles.contentLink}
                                        >
                                            Watch the video
                                        </div>
                                        {lesson.file && (
                                            <div 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isUserAllowed()) {
                                                        const { data } = supabase.storage
                                                            .from('document')
                                                            .getPublicUrl(lesson.file!);

                                                        if (data?.publicUrl) {
                                                            window.open(data.publicUrl, '_blank');
                                                        } else {
                                                            alert('The download URL was not found.');
                                                        }
                                                    } else {
                                                        Swal.fire('You must be enrolled or logged in to download this document.');
                                                    }
                                                }} 
                                                className={styles.contentLink}
                                            >
                                                Download documents
                                            </div>
                                        )}
                                        {/* ตรวจสอบว่า lesson มี quiz หรือไม่ */}
                                        {quizzes.some(quiz => quiz.lesson_id === lesson.id) && isUserAllowed() && (
                                            <div 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuizClick(lesson.id);
                                                }} 
                                                className={styles.contentLink}
                                            >
                                                Take Quiz
                                            </div>
                                        )}
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