import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { LessonView } from './components/Course/LessonView';
import { CreateLesson } from './components/Course/CreateLesson';
import { StudentProfile, TeacherProfile } from './pages/index';
import { LessonList } from './components/Course/LessonList';
import { GuestHome } from './pages/GuestHome';

export const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lessons/:id" element={<LessonView />} />
        <Route path="/create-lesson" element={<CreateLesson />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/teacher-profile" element={<TeacherProfile />} />
        <Route path="/lessons" element={<LessonList />} />
        <Route path="/guest-home" element={<GuestHome />} />
      </Routes>
    </Layout>
  );
};