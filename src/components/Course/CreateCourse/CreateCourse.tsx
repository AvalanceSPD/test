import React, { useEffect, useState } from 'react';
import styles from './CreateCourse.module.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabaseClient';
import { Grid, Row, Col } from 'rsuite';
import { useWallet } from '@solana/wallet-adapter-react';
import Swal from 'sweetalert2';

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

interface Quiz {
    id: number;
    question: string;
    opts1: string;
    opts2: string;
    opts3: string;
    answer: string;
    lesson_id: number;
}

const CreateCourse = () => {
    const navigate = useNavigate();
    const { publicKey } = useWallet();
    
    // Course state
    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    
    // Lessons state
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null);
    
    // Quiz state
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
    
    // User state
    const [userRole, setUserRole] = useState<'student' | 'instructor' | null>(null);
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
    const [profiledata, setProfiledata] = useState<profiledata | null>(null);
    const [instructorId, setInstructorId] = useState<string | null>(null);
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

    useEffect(() => {
        const checkUser = async () => {
          if (publicKey) {
            try {
              const { data, error } = await supabase
                .rpc('check_role_in_navebar', {
                  p_public_key:publicKey
                })
                if (error) {
                    console.error(error);
                    setIsRegistered(false);
                    setUserRole(null);
                    return;
                }
              
              if (data.is_instructor == true) {
                setIsRegistered(true);
                setUserRole('instructor');
                
                // ดึง instructor_id
                try {
                    // ดึง user_id ก่อน
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('wallet_address', publicKey.toString())
                        .single();
                        
                    if (userError) {
                        console.error('Error fetching user ID:', userError);
                        return;
                    }
                    
                    if (userData && userData.id) {
                        // ใช้ user_id เพื่อดึง instructor_id
                        const { data: instructorData, error: instructorError } = await supabase
                            .from('instructors_list')
                            .select('id')
                            .eq('ins_id', userData.id)
                            .single();
                            
                        if (instructorError) {
                            console.error('Error fetching instructor ID:', instructorError);
                        } else if (instructorData) {
                            setInstructorId(instructorData.id);
                            console.log('Instructor ID set:', instructorData.id);
                        }
                    }
                } catch (err) {
                    console.error('Error in instructor ID fetch:', err);
                }
              }
              
              if (data) {
                setProfiledata(data);
              }
              
              if (data.is_student == true) {
                setIsRegistered(true);
                setUserRole('student');
              }
            } catch (error) {
              console.error('Error in checkUser:', error);
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

    // ตรวจสอบว่าผู้ใช้เป็น instructor หรือไม่
    useEffect(() => {
        // เพิ่มเงื่อนไขให้ตรวจสอบเฉพาะเมื่อ userRole ถูกกำหนดค่าแล้ว (ไม่ใช่ null)
        // และเมื่อ userRole ไม่ใช่ instructor จึงจะแสดงข้อความ Access Denied
        if (userRole !== null && userRole !== 'instructor') {
            console.log('User role is not instructor:', userRole);
            Swal.fire({
                title: 'Access Denied',
                text: 'Only instructors can create courses',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/');
            });
        }
    }, [userRole, navigate]);

    // เพิ่ม useEffect เพื่อแสดงข้อมูลสถานะเมื่อ userRole หรือ instructorId เปลี่ยนแปลง
    useEffect(() => {
        console.log('Current user role:', userRole);
        console.log('Current instructor ID:', instructorId);
    }, [userRole, instructorId]);

    // ฟังก์ชันสำหรับอัปโหลดรูปภาพ
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCourseThumbnail(file);
            
            // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // ฟังก์ชันสำหรับเพิ่ม lesson ใหม่
    const addNewLesson = () => {
        const newLesson: Lesson = {
            id: lessons.length + 1,
            title: '',
            media: '',
            description: '',
            file: '',
            hasQuiz: false
        };
        
        setLessons([...lessons, newLesson]);
        setCurrentLessonIndex(lessons.length);
        setExpandedLesson(lessons.length);
    };

    // ฟังก์ชันสำหรับอัปเดต lesson
    const updateLesson = (index: number, field: keyof Lesson, value: string) => {
        const updatedLessons = [...lessons];
        updatedLessons[index] = {
            ...updatedLessons[index],
            [field]: value
        };
        setLessons(updatedLessons);
    };

    // ฟังก์ชันสำหรับลบ lesson
    const removeLesson = (index: number) => {
        const updatedLessons = lessons.filter((_, i) => i !== index);
        setLessons(updatedLessons);
        setExpandedLesson(null);
    };

    // ฟังก์ชันสำหรับเพิ่ม quiz
    const addQuizToLesson = (lessonIndex: number) => {
        const newQuiz: Quiz = {
            id: quizzes.length + 1,
            question: '',
            opts1: '',
            opts2: '',
            opts3: '',
            answer: '',
            lesson_id: lessons[lessonIndex].id
        };
        
        setQuizzes([...quizzes, newQuiz]);
        setCurrentQuiz(newQuiz);
        
        // อัปเดต lesson ให้มี hasQuiz เป็น true
        const updatedLessons = [...lessons];
        updatedLessons[lessonIndex].hasQuiz = true;
        setLessons(updatedLessons);
    };

    // ฟังก์ชันสำหรับอัปเดต quiz
    const updateQuiz = (quizId: number, field: keyof Quiz, value: string) => {
        const updatedQuizzes = [...quizzes];
        const quizIndex = updatedQuizzes.findIndex(q => q.id === quizId);
        
        if (quizIndex !== -1) {
            updatedQuizzes[quizIndex] = {
                ...updatedQuizzes[quizIndex],
                [field]: value
            };
            setQuizzes(updatedQuizzes);
        }
    };

    // ฟังก์ชันสำหรับลบ quiz
    const removeQuiz = (quizId: number, lessonId: number) => {
        const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
        setQuizzes(updatedQuizzes);
        
        // อัปเดต lesson ให้มี hasQuiz เป็น false ถ้าไม่มี quiz เหลือ
        const hasRemainingQuiz = updatedQuizzes.some(q => q.lesson_id === lessonId);
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        
        if (lessonIndex !== -1 && !hasRemainingQuiz) {
            const updatedLessons = [...lessons];
            updatedLessons[lessonIndex].hasQuiz = false;
            setLessons(updatedLessons);
        }
    };

    // ฟังก์ชันสำหรับอัปโหลดไฟล์เอกสาร
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, lessonIndex: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            try {
                // อัปโหลดไฟล์ไปยัง Supabase Storage
                const { data, error } = await supabase.storage
                    .from('document')
                    .upload(`${Date.now()}_${file.name}`, file);
                
                if (error) {
                    throw error;
                }
                
                // อัปเดต lesson ด้วยพาธของไฟล์
                const updatedLessons = [...lessons];
                updatedLessons[lessonIndex].file = data.path;
                setLessons(updatedLessons);
                
                Swal.fire({
                    title: 'Success',
                    text: 'File uploaded successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to upload file',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    // ฟังก์ชันสำหรับบันทึกคอร์ส
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!instructorId) {
            Swal.fire({
                title: 'Error',
                text: 'ไม่พบข้อมูลผู้สอน กรุณาลองใหม่อีกครั้ง',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        if (!courseTitle || !courseDescription || !courseThumbnail) {
            Swal.fire({
                title: 'Error',
                text: 'กรุณากรอกข้อมูลคอร์สให้ครบถ้วน',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        if (lessons.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Please add at least one lesson',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        // ตรวจสอบว่า lesson ทุกตัวมีข้อมูลครบถ้วน
        const invalidLessons = lessons.filter(lesson => !lesson.title || !lesson.media || !lesson.description);
        if (invalidLessons.length > 0) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill in all lesson details',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        setLoading(true);
        
        try {
            // 1. อัปโหลดรูปภาพ thumbnail
            let thumbnailPath = '';
            if (courseThumbnail) {
                const { data: thumbnailData, error: thumbnailError } = await supabase.storage
                    .from('thumbnails')
                    .upload(`${Date.now()}_${courseThumbnail.name}`, courseThumbnail);
                
                if (thumbnailError) {
                    throw thumbnailError;
                }
                
                thumbnailPath = thumbnailData.path;
                
                // สร้าง URL สำหรับรูปภาพ
                const { data: urlData } = supabase.storage
                    .from('thumbnails')
                    .getPublicUrl(thumbnailPath);
                
                thumbnailPath = urlData.publicUrl;
            }
            
            // 2. สร้างคอร์สใหม่
            const { data: courseData, error: courseError } = await supabase
                .from('course')
                .insert([
                    {
                        title: courseTitle,
                        description: courseDescription,
                        thumbnail: thumbnailPath,
                        create_by: instructorId
                    }
                ])
                .select();
            
            if (courseError) {
                throw courseError;
            }
            
            const courseId = courseData[0].id;
            
            // 3. สร้าง lessons
            for (const lesson of lessons) {
                const { data: lessonData, error: lessonError } = await supabase
                    .from('lesson')
                    .insert([
                        {
                            title: lesson.title,
                            media: lesson.media,
                            description: lesson.description,
                            file: lesson.file,
                            course_id: courseId
                        }
                    ])
                    .select();
                
                if (lessonError) {
                    throw lessonError;
                }
                
                const lessonId = lessonData[0].id;
                
                // 4. สร้าง quizzes สำหรับ lesson นี้
                const lessonQuizzes = quizzes.filter(q => q.lesson_id === lesson.id);
                
                for (const quiz of lessonQuizzes) {
                    const { error: quizError } = await supabase
                        .from('quiz')
                        .insert([
                            {
                                question: quiz.question,
                                opts1: quiz.opts1,
                                opts2: quiz.opts2,
                                opts3: quiz.opts3,
                                answer: quiz.answer,
                                lesson_id: lessonId
                            }
                        ]);
                    
                    if (quizError) {
                        throw quizError;
                    }
                }
            }
            
            Swal.fire({
                title: 'Success',
                text: 'Course created successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate(`/course/${courseId}`);
            });
            
        } catch (error: any) {
            console.error('Error creating course:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Failed to create course',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleLesson = (index: number) => {
        setExpandedLesson(expandedLesson === index ? null : index);
        setCurrentLessonIndex(index);
    };

    // ตรวจสอบว่า URL YouTube ถูกต้องหรือไม่
    const isValidYoutubeUrl = (url: string) => {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return pattern.test(url);
    };

    // แปลง YouTube URL เป็น embed URL
    const getYoutubeEmbedUrl = (url: string) => {
        if (!url) return '';
        
        try {
            const videoId = url.split('v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        } catch (error) {
            return '';
        }
    };

    return (
        <Grid fluid>
            <Row className={styles.header}>
                <Col xs={24}>
                    <div className={styles.headerBox}>
                        <h1>สร้างคอร์สใหม่</h1>
                        {userRole !== 'instructor' && (
                            <div className={styles.warningMessage}>
                                <p>คุณต้องเป็นผู้สอนเพื่อสร้างคอร์ส</p>
                    </div>
                        )}
                    </div>
                </Col>
            </Row>

            {userRole === 'instructor' && (
                <form onSubmit={handleSubmit}>
            <Row className={styles.contentRow}>
                        <Col xs={24} className={styles.mainContentCol}>
                            <div className={styles.formSection}>
                                <h2>ข้อมูลคอร์ส</h2>
                                <div className={styles.formGroup}>
                                    <label htmlFor="courseTitle">ชื่อคอร์ส *</label>
                                    <input
                                        type="text"
                                        id="courseTitle"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        required
                                        className={styles.formInput}
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="courseDescription">คำอธิบายคอร์ส *</label>
                                    <textarea
                                        id="courseDescription"
                                        value={courseDescription}
                                        onChange={(e) => setCourseDescription(e.target.value)}
                                        required
                                        className={styles.formTextarea}
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="courseThumbnail">รูปภาพปก *</label>
                                    <input
                                        type="file"
                                        id="courseThumbnail"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        required
                                        className={styles.formInput}
                                    />
                                    
                                    {thumbnailPreview && (
                                        <div className={styles.thumbnailPreview}>
                                            <img src={thumbnailPreview} alt="Thumbnail preview" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.formSection}>
                                <h2>บทเรียน</h2>
                                <button
                                    type="button"
                                    onClick={addNewLesson}
                                    className={styles.addButton}
                                >
                                    + เพิ่มบทเรียนใหม่
                                </button>
                                
                                {lessons.length === 0 && (
                                    <div className={styles.emptyState}>
                                        <p>ยังไม่มีบทเรียน กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน</p>
                                    </div>
                                )}
                                
                                {lessons.map((lesson, index) => (
                                    <div key={index} className={styles.lessonContainer}>
                                        <div 
                                            className={styles.lessonHeader}
                                            onClick={() => toggleLesson(index)}
                                        >
                                            <h3>{lesson.title || `บทเรียนที่ ${index + 1}`}</h3>
                                            <span>{expandedLesson === index ? '▲' : '▼'}</span>
                                        </div>
                                        
                                        {expandedLesson === index && (
                                            <div className={styles.lessonForm}>
                                                <div className={styles.formGroup}>
                                                    <label htmlFor={`lessonTitle-${index}`}>ชื่อบทเรียน *</label>
                                                    <input
                                                        type="text"
                                                        id={`lessonTitle-${index}`}
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                                        required
                                                        className={styles.formInput}
                                                    />
                                                </div>
                                                
                                                <div className={styles.formGroup}>
                                                    <label htmlFor={`lessonMedia-${index}`}>URL วิดีโอ YouTube *</label>
                                                    <input
                                                        type="text"
                                                        id={`lessonMedia-${index}`}
                                                        value={lesson.media}
                                                        onChange={(e) => updateLesson(index, 'media', e.target.value)}
                                                        required
                                                        className={styles.formInput}
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                    
                                                    {lesson.media && !isValidYoutubeUrl(lesson.media) && (
                                                        <p className={styles.errorText}>URL ไม่ถูกต้อง กรุณาใส่ URL ของ YouTube</p>
                                                    )}
                                                    
                                                    {lesson.media && isValidYoutubeUrl(lesson.media) && (
                                                        <div className={styles.videoPreview}>
                                                            <iframe
                                                                src={getYoutubeEmbedUrl(lesson.media)}
                                                                frameBorder="0"
                                                                allowFullScreen
                                                                className={styles.previewVideo}
                                                            />
                                        </div>
                                        )}
                                                </div>
                                                
                                                <div className={styles.formGroup}>
                                                    <label htmlFor={`lessonDescription-${index}`}>คำอธิบายบทเรียน *</label>
                                                    <textarea
                                                        id={`lessonDescription-${index}`}
                                                        value={lesson.description}
                                                        onChange={(e) => updateLesson(index, 'description', e.target.value)}
                                                        required
                                                        className={styles.formTextarea}
                                                    />
                                                </div>
                                                
                                                <div className={styles.formGroup}>
                                                    <label htmlFor={`lessonFile-${index}`}>เอกสารประกอบ (ถ้ามี)</label>
                                                    <input
                                                        type="file"
                                                        id={`lessonFile-${index}`}
                                                        onChange={(e) => handleFileUpload(e, index)}
                                                        className={styles.formInput}
                                                    />
                                                    
                                                    {lesson.file && (
                                                        <p className={styles.fileUploaded}>อัปโหลดไฟล์แล้ว</p>
                                                    )}
                                                </div>
                                                
                                                <div className={styles.quizSection}>
                                                    <h4>แบบทดสอบ</h4>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => addQuizToLesson(index)}
                                                        className={styles.addButton}
                                                    >
                                                        + เพิ่มแบบทดสอบ
                                                    </button>
                                                    
                                                    {quizzes.filter(q => q.lesson_id === lesson.id).map((quiz, quizIndex) => (
                                                        <div key={quizIndex} className={styles.quizContainer}>
                                                            <h5>คำถามที่ {quizIndex + 1}</h5>
                                                            
                                                            <div className={styles.formGroup}>
                                                                <label htmlFor={`quizQuestion-${quiz.id}`}>คำถาม *</label>
                                                                <input
                                                                    type="text"
                                                                    id={`quizQuestion-${quiz.id}`}
                                                                    value={quiz.question}
                                                                    onChange={(e) => updateQuiz(quiz.id, 'question', e.target.value)}
                                                                    required
                                                                    className={styles.formInput}
                                                                />
                                                            </div>
                                                            
                                                            <div className={styles.formGroup}>
                                                                <label htmlFor={`quizOpt1-${quiz.id}`}>ตัวเลือกที่ 1 *</label>
                                                                <input
                                                                    type="text"
                                                                    id={`quizOpt1-${quiz.id}`}
                                                                    value={quiz.opts1}
                                                                    onChange={(e) => updateQuiz(quiz.id, 'opts1', e.target.value)}
                                                                    required
                                                                    className={styles.formInput}
                                                                />
                                                            </div>
                                                            
                                                            <div className={styles.formGroup}>
                                                                <label htmlFor={`quizOpt2-${quiz.id}`}>ตัวเลือกที่ 2 *</label>
                                                                <input
                                                                    type="text"
                                                                    id={`quizOpt2-${quiz.id}`}
                                                                    value={quiz.opts2}
                                                                    onChange={(e) => updateQuiz(quiz.id, 'opts2', e.target.value)}
                                                                    required
                                                                    className={styles.formInput}
                                                                />
                                                            </div>
                                                            
                                                            <div className={styles.formGroup}>
                                                                <label htmlFor={`quizOpt3-${quiz.id}`}>ตัวเลือกที่ 3 *</label>
                                                                <input
                                                                    type="text"
                                                                    id={`quizOpt3-${quiz.id}`}
                                                                    value={quiz.opts3}
                                                                    onChange={(e) => updateQuiz(quiz.id, 'opts3', e.target.value)}
                                                                    required
                                                                    className={styles.formInput}
                                                                />
                                                            </div>
                                                            
                                                            <div className={styles.formGroup}>
                                                                <label htmlFor={`quizAnswer-${quiz.id}`}>คำตอบที่ถูกต้อง *</label>
                                                                <input
                                                                    type="text"
                                                                    id={`quizAnswer-${quiz.id}`}
                                                                    value={quiz.answer}
                                                                    onChange={(e) => updateQuiz(quiz.id, 'answer', e.target.value)}
                                                                    required
                                                                    className={styles.formInput}
                                                                />
                                                            </div>
                                                            
                                                            <button
                                                                type="button"
                                                                onClick={() => removeQuiz(quiz.id, lesson.id)}
                                                                className={styles.removeButton}
                                                            >
                                                                ลบแบบทดสอบนี้
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => removeLesson(index)}
                                                    className={styles.removeButton}
                                                >
                                                    ลบบทเรียนนี้
                                                </button>
                                        </div>
                                        )}
                                </div>
                                ))}
                            </div>
                            
                            <div className={styles.submitSection}>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? 'กำลังบันทึก...' : 'สร้างคอร์ส'}
                                </button>
                    </div>
                </Col>
            </Row>
                </form>
            )}
        </Grid>
    );
};

export default CreateCourse;