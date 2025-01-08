import React from 'react';
import { useParams } from 'react-router-dom';

export const CourseDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Course Detail</h1>
      <p>Course ID: {id}</p>
      {/* Add course detail content here */}
    </div>
  );
}; 