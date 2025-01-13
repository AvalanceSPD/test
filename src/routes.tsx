import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Profile from './pages/Profile';
import { LessonView } from './components/Course/LessonView';
import { CreateLesson } from './components/Course/CreateLesson';
<<<<<<< HEAD
import { StudentProfile, TeacherProfile } from './pages/index';
=======
import { LessonList } from './components/Course/LessonList';   
>>>>>>> kong

export const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lessons/:id" element={<LessonView />} />
        <Route path="/create-lesson" element={<CreateLesson />} />
<<<<<<< HEAD
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/teacher-profile" element={<TeacherProfile />} />
=======
        <Route path="/lessons" element={<LessonList />} />
>>>>>>> kong
      </Routes>
    </Layout>
  );
};