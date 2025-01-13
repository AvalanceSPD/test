import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import styles from './LessonList.module.css';

interface SubjectGroup {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  group_id: string;
}

export const LessonList = () => {
  const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // ดึงข้อมูลกลุ่มวิชา
        const { data: groupsData } = await supabase
          .from('subject_groups')
          .select('*')
          .order('order_index');

        // ดึงข้อมูลหมวดหมู่
        const { data: categoriesData } = await supabase
          .from('subject_categories')
          .select('*')
          .order('name');

        if (groupsData) setSubjectGroups(groupsData);
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

  const toggleGroup = (groupId: string) => {
    setOpenGroup(openGroup === groupId ? null : groupId);
  };

  return (
    <div className={styles.container}>
      <h1>รายชื่อบทเรียน</h1>
      {isLoading && <p>กำลังโหลด...</p>}
      {error && <p>{error}</p>}
      <div className={styles.navbar}>
        {subjectGroups.map(group => (
          <div key={group.id} className={styles.subjectGroup}>
            <h2 onClick={() => toggleGroup(group.id)} className={styles.groupTitle}>
              {group.name}
            </h2>
            {openGroup === group.id && (
              <div className={styles.tabButtons}>
                {categories
                  .filter(category => category.group_id === group.id)
                  .map(category => (
                    <button
                      key={category.id}
                      className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.lessonGrid}>
        {lessons
          .filter(lesson => selectedCategory ? lesson.category_id === selectedCategory : true)
          .map(lesson => (
            <div key={lesson.id} className={styles.lessonCard}>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <div className={styles.lessonMeta}>
                {/* แสดงข้อมูลเพิ่มเติมถ้าต้องการ */}
              </div>
            </div>
          ))}
      </div>
      {lessons.length === 0 && <div className={styles.noLessons}>ไม่มีบทเรียนในหมวดหมู่นี้</div>}
    </div>
  );
}; 