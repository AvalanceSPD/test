import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../hooks/useUser';

interface Course {
  id: string;
  title: string;
  description: string;
}

export const CourseList = () => {
  const { userRole, userId } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      let query = supabase.from('courses').select('*');
      
      if (userRole === 'teacher') {
        query = query.eq('teacher_id', userId);
      }

      const { data, error } = await query;
      if (data) setCourses(data);
    };

    fetchCourses();
  }, [userRole, userId]);

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
};