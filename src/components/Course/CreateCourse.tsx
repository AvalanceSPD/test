import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../hooks/useUser';

export const CreateCourse = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: newCourse, error } = await supabase
      .from('courses')
      .insert([
        {
          title,
          description,
          teacher_id: userId
        }
      ]);

    if (error) {
      console.error('Error creating course:', error);
      return;
    }

    if (newCourse) {
      console.log('Course created:', newCourse);
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course Title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Course Description"
        required
      />
      <button type="submit">Create Course</button>
    </form>
  );
};