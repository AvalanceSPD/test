import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { LessonView } from './components/Course/LessonView';
import { CreateLesson } from './components/Course/CreateLesson';
import { StudentProfile, TeacherProfile, Home_1 } from './pages/index';
import { LessonList } from './components/Course/LessonList';
import { GuestHome } from './pages/GuestHome';
import TestPages from "./test/TestPages";

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
        <Route path="/home_1" element={<Home_1 />} />
        <Route path="/test" element={<TestPages />} />
      </Routes>
    </Layout>
  );
};