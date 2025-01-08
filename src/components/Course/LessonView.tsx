import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../../utils/supabaseClient';
import { Lesson, LessonSection, QuizResult } from '../../types/lesson';
import styles from './LessonView.module.css';

export const LessonView = () => {
  const { lessonId } = useParams();
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizStartTime, setQuizStartTime] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId || !publicKey) return;

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('บทเรียนไม่พบ');

        setLesson(data);

        // ดึงความก้าวหน้าของผู้เรียน
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('user_wallet', publicKey.toString());

        if (progressData && progressData.length > 0) {
          const lastSection = progressData[progressData.length - 1];
          if (!lastSection.completed) {
            setCurrentSectionIndex(lastSection.last_position || 0);
          }
        }

      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('ไม่สามารถโหลดบทเรียนได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, publicKey]);

  const handleQuizStart = (questionId: string) => {
    setQuizStartTime({ ...quizStartTime, [questionId]: Date.now() });
  };

  const handleQuizSubmit = async (section: LessonSection) => {
    if (!publicKey || !lesson || !section.quiz) return;

    const results: QuizResult[] = section.quiz.map(question => {
      const userAnswer = quizAnswers[question.id];
      const timeSpent = (Date.now() - (quizStartTime[question.id] || Date.now())) / 1000;
      const isCorrect = userAnswer === question.correctAnswer;
      
      // คำนวณคะแนนตามความเร็วและความถูกต้อง
      let score = 0;
      if (isCorrect) {
        const timeBonus = Math.max(0, 1 - (timeSpent / question.timeLimit));
        score = question.points * (1 + timeBonus);
      }

      return {
        questionId: question.id,
        userAnswer,
        timeSpent,
        isCorrect,
        score
      };
    });

    try {
      // บันทึกผลลัพธ์
      await supabase
        .from('user_progress')
        .upsert({
          user_wallet: publicKey.toString(),
          lesson_id: lesson.id,
          section_id: section.id,
          completed: true,
          quiz_results: results,
          completed_at: new Date().toISOString()
        });

      // ไปยังส่วนถัดไป
      if (currentSectionIndex < lesson.sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      }

    } catch (err) {
      console.error('Error saving quiz results:', err);
    }
  };

  const renderSection = (section: LessonSection) => {
    switch (section.type) {
      case 'video':
        return (
          <div className={styles.videoContainer}>
            <iframe
              src={section.videoUrl}
              title={section.title}
              allowFullScreen
              className={styles.videoPlayer}
            />
          </div>
        );

      case 'content':
        return (
          <div className={styles.contentSection}>
            <h2>{section.title}</h2>
            <div className={styles.content}>{section.content}</div>
          </div>
        );

      case 'quiz':
        return (
          <div className={styles.quizSection}>
            <h2>{section.title}</h2>
            {section.quiz?.map(question => (
              <div key={question.id} className={styles.question}>
                <h3>{question.question}</h3>
                <div className={styles.options}>
                  {question.options.map((option, index) => (
                    <label key={index} className={styles.option}>
                      <input
                        type="radio"
                        name={question.id}
                        value={index}
                        checked={quizAnswers[question.id] === index}
                        onChange={() => {
                          if (!quizStartTime[question.id]) {
                            handleQuizStart(question.id);
                          }
                          setQuizAnswers({
                            ...quizAnswers,
                            [question.id]: index
                          });
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {quizStartTime[question.id] && (
                  <div className={styles.timer}>
                    เวลาที่เหลือ: {Math.max(0, question.timeLimit - 
                      Math.floor((Date.now() - quizStartTime[question.id]) / 1000))} วินาที
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => handleQuizSubmit(section)}
              className={styles.submitButton}
            >
              ส่งคำตอบ
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>กำลังโหลด...</div>;
  }

  if (error || !lesson) {
    return <div className={styles.error}>{error || 'ไม่พบบทเรียน'}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{lesson.title}</h1>
        <p>{lesson.description}</p>
      </div>

      <div className={styles.navigation}>
        {lesson.sections.map((section, index) => (
          <button
            key={section.id}
            className={`${styles.navButton} ${index === currentSectionIndex ? styles.active : ''}`}
            onClick={() => setCurrentSectionIndex(index)}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className={styles.sectionContent}>
        {renderSection(lesson.sections[currentSectionIndex])}
      </div>

      <div className={styles.controls}>
        {currentSectionIndex > 0 && (
          <button
            onClick={() => setCurrentSectionIndex(currentSectionIndex - 1)}
            className={styles.navButton}
          >
            ก่อนหน้า
          </button>
        )}
        {currentSectionIndex < lesson.sections.length - 1 && (
          <button
            onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
            className={styles.navButton}
          >
            ถัดไป
          </button>
        )}
      </div>
    </div>
  );
}; 