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

interface ProfileData {
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
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
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
                  p_public_key: publicKey
                });
                if (error) {
                    console.error(error);
                    setIsRegistered(false);
                    setUserRole(null);
                    return;
                }
              
              if (data.is_instructor === true) {
                setIsRegistered(true);
                setUserRole('instructor');
                
                // Fetch instructor_id
                try {
                    // Fetch user_id first
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
                        // Use user_id to fetch instructor_id
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
                setProfileData(data);
              }
              
              if (data.is_student === true) {
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

    // Check if the user is an instructor
    useEffect(() => {
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

    // Log current user role and instructor ID
    useEffect(() => {
        console.log('Current user role:', userRole);
        console.log('Current instructor ID:', instructorId);
    }, [userRole, instructorId]);

    // Function to handle thumbnail upload
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCourseThumbnail(file);
            
            // Create a URL for the thumbnail preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to add a new lesson
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

    // Function to update a lesson
    const updateLesson = (index: number, field: keyof Lesson, value: string) => {
        const updatedLessons = [...lessons];
        updatedLessons[index] = {
            ...updatedLessons[index],
            [field]: value
        };
        setLessons(updatedLessons);
    };

    // Function to remove a lesson
    const removeLesson = (index: number) => {
        const updatedLessons = lessons.filter((_, i) => i !== index);
        setLessons(updatedLessons);
        
        // ปรับค่า currentLessonIndex เมื่อลบ lesson
        if (currentLessonIndex !== null) {
            if (updatedLessons.length === 0) {
                // ถ้าไม่มี lesson เหลือ ให้ตั้งค่าเป็น null
                setCurrentLessonIndex(null);
            } else if (currentLessonIndex === index) {
                // ถ้าลบ lesson ที่กำลังดูอยู่
                // ให้เลือก lesson ก่อนหน้า หรือ lesson แรกถ้าลบ lesson แรก
                setCurrentLessonIndex(index === 0 ? 0 : index - 1);
            } else if (currentLessonIndex > index) {
                // ถ้าลบ lesson ที่อยู่ก่อนหน้า lesson ที่กำลังดูอยู่
                // ให้ปรับ index ลง 1
                setCurrentLessonIndex(currentLessonIndex - 1);
            }
            // ถ้าลบ lesson ที่อยู่หลัง lesson ที่กำลังดูอยู่ ไม่ต้องปรับ currentLessonIndex
        }
        
        setExpandedLesson(null);
    };

    // Function to add a new quiz
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
        
        // Update lesson to have hasQuiz as true
        const updatedLessons = [...lessons];
        updatedLessons[lessonIndex].hasQuiz = true;
        setLessons(updatedLessons);
    };

    // Function to update a quiz
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

    // Function to remove a quiz
    const removeQuiz = (quizId: number, lessonId: number) => {
        const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
        setQuizzes(updatedQuizzes);
        
        // Update lesson to have hasQuiz as false if no quiz remains
        const hasRemainingQuiz = updatedQuizzes.some(q => q.lesson_id === lessonId);
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        
        if (lessonIndex !== -1 && !hasRemainingQuiz) {
            const updatedLessons = [...lessons];
            updatedLessons[lessonIndex].hasQuiz = false;
            setLessons(updatedLessons);
        }
    };

    // Function to handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, lessonIndex: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            try {
                // Upload file to Supabase Storage
                const { data, error } = await supabase.storage
                    .from('document')
                    .upload(`${Date.now()}_${file.name}`, file);
                
                if (error) {
                    throw error;
                }
                
                // Update lesson with file path
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!instructorId) {
            Swal.fire({
                title: 'Error',
                text: 'Instructor ID not found, please try again',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        if (!courseTitle || !courseDescription || !courseThumbnail) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill in all course information',
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
        
        // Check if all lessons have complete information
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
            // 1. Upload thumbnail image
            let thumbnailPath = '';
            if (courseThumbnail) {
                const { data: thumbnailData, error: thumbnailError } = await supabase.storage
                    .from('thumbnail')
                    .upload(`${Date.now()}_${courseThumbnail.name}`, courseThumbnail);
                
                if (thumbnailError) {
                    throw thumbnailError;
                }
                
                thumbnailPath = thumbnailData.path;
                
                // Create URL for the thumbnail
                const { data: urlData } = supabase.storage
                    .from('thumbnail')
                    .getPublicUrl(thumbnailPath);
                
                thumbnailPath = urlData.publicUrl;
            }
            
            // 2. Create new course
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
            
            // 3. Create lessons
            for (const lesson of lessons) {
                const { data: lessonData, error: lessonError } = await supabase
                    .from('lesson')
                    .insert([
                        {
                            title: lesson.title,
                            media: lesson.media,
                            description: lesson.description,
                            file: lesson.file,
                            course_id: courseId,
                        }
                    ])
                    .select();
                
                if (lessonError) {
                    throw lessonError;
                }
                
                const lessonId = lessonData[0].id;
                
                // 4. Create quizzes for this lesson
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

    // Function to toggle lesson visibility
    const toggleLesson = (index: number) => {
        setExpandedLesson(expandedLesson === index ? null : index);
        setCurrentLessonIndex(index);
    };

    // Check if YouTube URL is valid
    const isValidYoutubeUrl = (url: string) => {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return pattern.test(url);
    };

    // Convert YouTube URL to embed URL
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
                        <Row>
                            <Col xs={8} className={styles.thumbnailCol}>
                                <div className={styles.thumbnailContainer}>
                                    {thumbnailPreview ? (
                                        <img 
                                            src={thumbnailPreview} 
                                            alt="Course thumbnail" 
                                            className={styles.thumbnail}
                                        />
                                    ) : (
                                        <div className={styles.uploadPlaceholder}>
                                            <span>Upload Thumbnail Image</span>
                                            <input
                                                type="file"
                                                id="courseThumbnail"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                required
                                                className={styles.thumbnailInput}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col xs={16} className={styles.lessonTitleCol}>
                                <div className={styles.lessonTitle}>
                                    <h1>Create New Course</h1>
                                    {userRole !== 'instructor' && (
                                        <div className={styles.warningMessage}>
                                            <p>You must be an instructor to create a course</p>
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        id="courseTitle"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        required
                                        className={styles.titleInput}
                                        placeholder="Course Title *"
                                    />
                                    <div className={styles.courseInfo}>
                                        <p>Create by: {profileData?.ins_name || 'Loading...'}</p>
                                    </div>
                                    <div className={styles.descriptionText}>
                                        <textarea
                                            id="courseDescription"
                                            value={courseDescription}
                                            onChange={(e) => setCourseDescription(e.target.value)}
                                            required
                                            className={styles.headerDescription}
                                            placeholder="Course Description *"
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            {userRole === 'instructor' && (
                <form onSubmit={handleSubmit}>
                    <Row className={styles.contentRow}>
                        <Col xs={16} className={styles.mainContentCol}>
                            <div className={styles.videoContainer}>
                                {lessons.length > 0 && currentLessonIndex !== null && 
                                 lessons[currentLessonIndex] && lessons[currentLessonIndex].media && 
                                 isValidYoutubeUrl(lessons[currentLessonIndex].media) ? (
                                    <iframe
                                        src={getYoutubeEmbedUrl(lessons[currentLessonIndex].media)}
                                        frameBorder="0"
                                        allowFullScreen
                                        className={styles.video}
                                    />
                                ) : (
                                    <div className={styles.emptyVideoState}>
                                        <p>Add lessons and videos to see a preview</p>
                                    </div>
                                )}
                            </div>
                            
                            {lessons.length > 0 && currentLessonIndex !== null && lessons[currentLessonIndex] && (
                                <div className={styles.lessonList}>
                                    <div className={styles.descriptionText}>
                                        <h2>{lessons[currentLessonIndex].title || 'Lesson Title'}</h2>
                                        <p>{lessons[currentLessonIndex].description || 'Lesson Description'}</p>
                                    </div>
                                </div>
                            )}
                        </Col>

                        <Col xs={8} className={styles.sidebarCol}>
                            <div className={styles.rightSection}>
                                <h3>Contents</h3>
                                <button
                                    type="button"
                                    onClick={addNewLesson}
                                    className={styles.addButton}
                                >
                                    + Add New Lesson
                                </button>
                                
                                {lessons.length === 0 && (
                                    <div className={styles.emptyState}>
                                        <p>No lessons yet. Please add at least one lesson.</p>
                                    </div>
                                )}
                                
                                {lessons.map((lesson, index) => (
                                    <div key={index} className={styles.lessonContainer}>
                                        <h4 
                                            className={styles.lessonTitle} 
                                            onClick={() => toggleLesson(index)}
                                        >
                                            {lesson.title || `Lesson ${index + 1}`} {expandedLesson === index ? '▲' : '▼'}
                                        </h4>
                                        {expandedLesson === index && (
                                            <div className={styles.lessonContent}>
                                                <div className={styles.formGroup}>
                                                    <label htmlFor={`lessonTitle-${index}`}>Lesson Title *</label>
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
                                                    <label htmlFor={`lessonMedia-${index}`}>YouTube Video URL *</label>
                                                    <input
                                                        type="text"
                                                        id={`lessonMedia-${index}`}
                                                        value={lesson.media}
                                                        onChange={(e) => updateLesson(index, 'media', e.target.value)}
                                                        required
                                                        className={styles.formInput}
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                </div>
                                                
                                                <div className={styles.formGroup}>
                                                    <label htmlFor={`lessonDescription-${index}`}>Lesson Description *</label>
                                                    <textarea
                                                        id={`lessonDescription-${index}`}
                                                        value={lesson.description}
                                                        onChange={(e) => updateLesson(index, 'description', e.target.value)}
                                                        required
                                                        className={styles.formTextarea}
                                                    />
                                                </div>
                                                
                                                <div className={styles.formGroup}>
                                                    <label htmlFor={`lessonFile-${index}`}>Supporting Documents (if any)</label>
                                                    <input
                                                        type="file"
                                                        id={`lessonFile-${index}`}
                                                        onChange={(e) => handleFileUpload(e, index)}
                                                        className={styles.formInput}
                                                    />
                                                    
                                                    {lesson.file && (
                                                        <p className={styles.fileUploaded}>File uploaded</p>
                                                    )}
                                                </div>
                                                
                                                <div className={styles.quizSection}>
                                                    <h4>Quizzes</h4>
                                                    
                                                    {quizzes.filter(q => q.lesson_id === lesson.id).map((quiz, quizIndex) => (
                                                        <div key={quizIndex} className={styles.quizContainer}>
                                                            <h5>Question {quizIndex + 1}</h5>
                                                            
                                                            <div className={styles.formGroup}>
                                                                <label htmlFor={`quizQuestion-${quiz.id}`}>Question *</label>
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
                                                                <label htmlFor={`quizAnswer-${quiz.id}`}>Correct Answer *</label>
                                                                <input
                                                                    type="text"
                                                                    id={`quizAnswer-${quiz.id}`}
                                                                    value={quiz.answer}
                                                                    onChange={(e) => updateQuiz(quiz.id, 'answer', e.target.value)}
                                                                    required
                                                                    className={styles.formInput}
                                                                />
                                                            </div>
                                                            
                                                            <div className={styles.formGroup}>
                                                                <label htmlFor={`quizOpt1-${quiz.id}`}>Option 1 *</label>
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
                                                                <label htmlFor={`quizOpt2-${quiz.id}`}>Option 2 *</label>
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
                                                                <label htmlFor={`quizOpt3-${quiz.id}`}>Option 3 *</label>
                                                                <input
                                                                    type="text"
                                                                    id={`quizOpt3-${quiz.id}`}
                                                                    value={quiz.opts3}
                                                                    onChange={(e) => updateQuiz(quiz.id, 'opts3', e.target.value)}
                                                                    required
                                                                    className={styles.formInput}
                                                                />
                                                            </div>
                                                            
                                                            <button
                                                                type="button"
                                                                onClick={() => removeQuiz(quiz.id, lesson.id)}
                                                                className={styles.removeButton}
                                                            >
                                                                Remove this quiz
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addQuizToLesson(index)}
                                                        className={styles.addButton}
                                                    >
                                                        + Add Quiz
                                                    </button>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => removeLesson(index)}
                                                    className={styles.removeButton}
                                                >
                                                    Remove this lesson
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                <div className={styles.submitSection}>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Create Course'}
                                    </button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </form>
            )}
        </Grid>
    );
};

export default CreateCourse;