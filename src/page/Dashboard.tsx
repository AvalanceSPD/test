import React from 'react';
import { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { CourseList } from '../components/Course/CourseList';
import { EnrolledCourses } from '../components/Student/EnrolledCourses';

const Dashboard = () => {
  const { userRole } = useUser();

  return (
    <div>
      <h1>Dashboard</h1>
      {userRole === 'teacher' ? (
        <>
          <h2>Your Courses</h2>
          <CourseList />
        </>
      ) : (
        <>
          <h2>Enrolled Courses</h2>
          <EnrolledCourses />
        </>
      )}
    </div>
  );
};

export default Dashboard;