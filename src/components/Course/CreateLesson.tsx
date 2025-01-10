import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../../utils/supabaseClient';
import styles from './CreateLesson.module.css';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

interface LessonSection {
  id: string;
  type: 'video' | 'content' | 'quiz';
  content: string;
  videoUrl?: string;
  quiz?: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  sections: LessonSection[];
}

interface NewCategory {
  name: string;
  description: string;
  group_id: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'subject' | 'grade';
  group_id?: string;
}

export const CreateLesson = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([createNewLesson()]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    description: '',
    group_id: ''
  });
  const [error, setError] = useState<string | null>(null);

  function createNewLesson(): Lesson {
    return {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      sections: []
    };
  }

  function createNewSection(type: LessonSection['type']): LessonSection {
    return {
      id: crypto.randomUUID(),
      type,
      content: '',
      ...(type === 'quiz' ? { quiz: [] } : {}),
      ...(type === 'video' ? { videoUrl: '' } : {})
    };
  }

  const addNewLesson = () => {
    const newLesson = createNewLesson();
    setLessons([...lessons, newLesson]);
    setCurrentLessonIndex(lessons.length);
  };

  const addSection = (type: LessonSection['type']) => {
    const updatedLessons = [...lessons];
    updatedLessons[currentLessonIndex].sections.push(createNewSection(type));
    setLessons(updatedLessons);
  };

  const addQuizQuestion = (sectionIndex: number) => {
    const updatedLessons = [...lessons];
    const section = updatedLessons[currentLessonIndex].sections[sectionIndex];
    if (section.type === 'quiz' && section.quiz) {
      section.quiz.push({
        id: crypto.randomUUID(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        timeLimit: 30
      });
    }
    setLessons(updatedLessons);
  };

  const updateLesson = (field: keyof Omit<Lesson, 'sections'>, value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[currentLessonIndex] = {
      ...updatedLessons[currentLessonIndex],
      [field]: value
    };
    setLessons(updatedLessons);
  };

  const updateSection = (sectionIndex: number, field: string, value: string) => {
    const updatedLessons = [...lessons];
    const section = updatedLessons[currentLessonIndex].sections[sectionIndex];
    (section as any)[field] = value;
    setLessons(updatedLessons);
  };

  const updateQuizQuestion = (sectionIndex: number, questionIndex: number, field: string, value: any) => {
    const updatedLessons = [...lessons];
    const section = updatedLessons[currentLessonIndex].sections[sectionIndex];
    if (section.type === 'quiz' && section.quiz) {
      (section.quiz[questionIndex] as any)[field] = value;
    }
    setLessons(updatedLessons);
  };

  const deleteLesson = (lessonIndex: number) => {
    if (window.confirm('ต้องการลบบทเรียนนี้ใช่หรือไม่?')) {
      const updatedLessons = lessons.filter((_, index) => index !== lessonIndex);
      setLessons(updatedLessons);
      setCurrentLessonIndex(updatedLessons.length > 0 ? Math.min(currentLessonIndex, updatedLessons.length - 1) : 0);
    }
  };

  const deleteSection = (sectionIndex: number) => {
    if (window.confirm('ต้องการลบส่วนนี้ใช่หรือไม่?')) {
      const updatedLessons = [...lessons];
      updatedLessons[currentLessonIndex].sections = 
        updatedLessons[currentLessonIndex].sections.filter((_, index) => index !== sectionIndex);
      setLessons(updatedLessons);
    }
  };

  const deleteQuizQuestion = (sectionIndex: number, questionIndex: number) => {
    if (window.confirm('ต้องการลบคำถามนี้ใช่หรือไม่?')) {
      const updatedLessons = [...lessons];
      const section = updatedLessons[currentLessonIndex].sections[sectionIndex];
      if (section.type === 'quiz' && section.quiz) {
        section.quiz = section.quiz.filter((_, index) => index !== questionIndex);
        setLessons(updatedLessons);
      }
    }
  };

  const handleSubmit = async () => {
    if (!publicKey) return;

    try {
      setIsSubmitting(true);

      // บันทึกข้อมูลลง Supabase
      const { data, error } = await supabase
        .from('lessons')
        .insert(
          lessons.map(lesson => ({
            teacher_wallet: publicKey.toString(),
            title: lesson.title,
            description: lesson.description,
            sections: lesson.sections,
            created_at: new Date().toISOString()
          }))
        );

      if (error) throw error;

      navigate('/teacher/lessons');
    } catch (error) {
      console.error('Error creating lessons:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกบทเรียน');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.name || !newCategory.group_id) {
      setError('กรุณากรอกชื่อหมวดหมู่และเลือกกลุ่ม');
      return;
    }

    try {
      const { data, error: categoryError } = await supabase
        .from('subject_categories')
        .insert([{
          name: newCategory.name,
          description: newCategory.description,
          group_id: newCategory.group_id,
          type: 'subject'
        }])
        .select()
        .single();

      if (categoryError) throw categoryError;

      // เพิ่มหมวดหมู่ใหม่เข้าไปใน state
      setCategories(prev => [...prev, data]);
      
      // เลือกหมวดหมู่ที่เพิ่มใหม่
      setSelectedCategories(prev => [...prev, data]);
      
      // รีเซ็ตฟอร์ม
      setNewCategory({
        name: '',
        description: '',
        group_id: ''
      });
      setShowAddCategory(false);
      setError(null);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('ไม่สามารถเพิ่มหมวดหมู่ไได้');
    }
  };

  return (
    <div className={styles.container}>
      <h1>สร้างบทเรียนใหม่</h1>

      <div className={styles.lessonTabs}>
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${index === currentLessonIndex ? styles.active : ''}`}
              onClick={() => setCurrentLessonIndex(index)}
            >
              บทที่ {index + 1}
            </button>
            <button
              onClick={() => deleteLesson(index)}
              className={styles.deleteButton}
              title="ลบบทเรียน"
            >
              ×
            </button>
          </div>
        ))}
        <button onClick={addNewLesson} className={styles.addButton}>
          + เพิ่มบทเรียน
        </button>
      </div>

      {currentLessonIndex !== null && lessons.length > 0 ? (
        <div className={styles.lessonForm}>
          <input
            type="text"
            placeholder="ชื่อบทเรียน"
            value={lessons[currentLessonIndex].title}
            onChange={(e) => updateLesson('title', e.target.value)}
            className={styles.input}
          />

          <textarea
            placeholder="คำอธิบยบทเรียน"
            value={lessons[currentLessonIndex].description}
            onChange={(e) => updateLesson('description', e.target.value)}
            className={styles.textarea}
          />

          <div className={styles.sections}>
            {lessons[currentLessonIndex].sections.map((section, sectionIndex) => (
              <div key={section.id} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>{section.type === 'video' ? 'วิดีโอ' : 
                       section.type === 'content' ? 'เนื้อหา' : 'แบบทดสอบ'}</h3>
                  <button
                    onClick={() => deleteSection(sectionIndex)}
                    className={styles.deleteButton}
                    title="ลบส่วนนี้"
                  >
                    ×
                  </button>
                </div>

                {section.type === 'video' && (
                  <div className={styles.videoSection}>
                    <input
                      type="text"
                      placeholder="URL วิดีโอ"
                      value={section.videoUrl}
                      onChange={(e) => updateSection(sectionIndex, 'videoUrl', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                )}

                {section.type === 'content' && (
                  <textarea
                    placeholder="เนื้อหบทเรียน"
                    value={section.content}
                    onChange={(e) => updateSection(sectionIndex, 'content', e.target.value)}
                    className={styles.textarea}
                  />
                )}

                {section.type === 'quiz' && section.quiz && (
                  <div className={styles.quizSection}>
                    {section.quiz.map((question, questionIndex) => (
                      <div key={question.id} className={styles.question}>
                        <div className={styles.questionHeader}>
                          <h4>คำถามที่ {questionIndex + 1}</h4>
                          <button
                            onClick={() => deleteQuizQuestion(sectionIndex, questionIndex)}
                            className={styles.deleteButton}
                            title="ลบคำถาม"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="คำถาม"
                          value={question.question}
                          onChange={(e) => updateQuizQuestion(sectionIndex, questionIndex, 'question', e.target.value)}
                          className={styles.input}
                        />
                        {question.options.map((option, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            placeholder={`ตัวเลือกที่ ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex] = e.target.value;
                              updateQuizQuestion(sectionIndex, questionIndex, 'options', newOptions);
                            }}
                            className={styles.input}
                          />
                        ))}
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => updateQuizQuestion(sectionIndex, questionIndex, 'correctAnswer', parseInt(e.target.value))}
                          className={styles.select}
                        >
                          {question.options.map((_, index) => (
                            <option key={index} value={index}>
                              คำตอบที่ถูก: {index + 1}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="เวลาในการตอบ (วินาที)"
                          value={question.timeLimit}
                          onChange={(e) => updateQuizQuestion(sectionIndex, questionIndex, 'timeLimit', parseInt(e.target.value))}
                          className={styles.input}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addQuizQuestion(sectionIndex)}
                      className={styles.addButton}
                    >
                      + เพิ่มคำถาม
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.addSectionButtons}>
            <button onClick={() => addSection('video')} className={styles.addButton}>
              + เพิ่มวิดีโอ
            </button>
            <button onClick={() => addSection('content')} className={styles.addButton}>
              + เพิ่มเนื้อหา
            </button>
            <button onClick={() => addSection('quiz')} className={styles.addButton}>
              + เพิ่มแบบทดสอบ
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกบทเรียน'}
          </button>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>ยังไม่มีบบทเรียน กรุณาคลิกปุ่ม "เพิ่มบทเรียน" เพื่อเริ่มสร้างบบทเรียนใหม่</p>
        </div>
      )}
    </div>
  );
}; 