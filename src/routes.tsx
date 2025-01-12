import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Profile from './pages/Profile';
import { LessonView } from './components/Course/LessonView';
import { CreateLesson } from './components/Course/CreateLesson';
import { LessonList } from './components/Course/LessonList';   
import Navbar from './components/Navbar'; // นำเข้า Navbar

export const AppRoutes = () => {
  return (
    <Layout>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lessons/:id" element={<LessonView />} />
        <Route path="/create-lesson" element={<CreateLesson />} />
        <Route path="/lessons" element={<LessonList />} />
      </Routes>
    </Layout>
  );
}; 