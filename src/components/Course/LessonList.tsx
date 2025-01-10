import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import styles from './LessonList.module.css';

interface SubjectGroup {
  id: string;
  name: string;
  description: string;
  order_index: number;
}

interface EducationLevel {
  id: string;
  name: string;
  description: string;
  order_index: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'subject' | 'grade';
  group_id?: string;
  education_level_id?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  teacher_wallet: string;
  category_id: string;
  created_at: string;
  teacher_name?: string;
}

export const LessonList = () => {
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subjects' | 'levels'>('subjects');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // ดึงข้อมูลกลุ่มวิชา
        const { data: groupsData } = await supabase
          .from('subject_groups')
          .select('*')
          .order('order_index');

        // ดึงข้อมูลระดับการศึกษา
        const { data: levelsData } = await supabase
          .from('education_levels')
          .select('*')
          .order('order_index');

        // ดึงข้อมูลหมวดหมู่
        const { data: categoriesData } = await supabase
          .from('subject_categories')
          .select('*')
          .order('name');

        if (groupsData) setSubjectGroups(groupsData);
        if (levelsData) setEducationLevels(levelsData);
        if (categoriesData) setCategories(categoriesData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedCategory) {
        setLessons([]);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            *,
            users!lessons_teacher_wallet_fkey (username)
          `)
          .eq('category_id', selectedCategory);

        if (lessonsError) throw lessonsError;

        setLessons(data.map(lesson => ({
          ...lesson,
          teacher_name: lesson.users?.username
        })));
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('ไม่สามารถโหลดบทเรียนได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [selectedCategory]);

  const getCategoriesByGroup = (groupId: string) => {
    return categories.filter(cat => cat.group_id === groupId);
  };

  const getCategoriesByLevel = (levelId: string) => {
    return categories.filter(cat => cat.education_level_id === levelId);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>บทเรียนทั้งหมด</h1>

      <div className={styles.tabButtons}>
        <button
          className={`${styles.tabButton} ${activeTab === 'subjects' ? styles.active : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          หมวดวิชา
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'levels' ? styles.active : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          ระดับการศึกษา
        </button>
      </div>

      <div className={styles.categoriesContainer}>
        {activeTab === 'subjects' ? (
          subjectGroups.map(group => (
            <div key={group.id} className={styles.categoryGroup}>
              <h2>{group.name}</h2>
              <div className={styles.categoryButtons}>
                {getCategoriesByGroup(group.id).map(category => (
                  <button
                    key={category.id}
                    className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          educationLevels.map(level => (
            <div key={level.id} className={styles.categoryGroup}>
              <h2>{level.name}</h2>
              <div className={styles.categoryButtons}>
                {getCategoriesByLevel(level.id).map(category => (
                  <button
                    key={category.id}
                    className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>กำลังโหลด...</div>
      ) : (
        <div className={styles.lessonGrid}>
          {lessons.length === 0 ? (
            <div className={styles.noLessons}>
              {selectedCategory ? 'ไม่พบบทเรียนในหมวดหมู่ที่เลือก' : 'กรุณาเลือกหมวดหมู่'}
            </div>
          ) : (
            lessons.map(lesson => (
              <Link
                to={`/lesson/${lesson.id}`}
                key={lesson.id}
                className={styles.lessonCard}
              >
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <div className={styles.lessonMeta}>
                  <span>สอนโย: {lesson.teacher_name}</span>
                  <span>สร้างเมื่อ: {new Date(lesson.created_at).toLocaleDateString('th-TH')}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}; 