import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { CourseDetail } from './components/Course/CourseDetail';
import { CreateCourse } from './components/Course/CreateCourse';
import { StudentProfile, TeacherProfile } from './pages/index';

export const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/teacher-profile" element={<TeacherProfile />} />
      </Routes>
    </Layout>
  );
};