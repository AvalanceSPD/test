import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Profile from './pages/Profile';
import { LessonView } from './components/Course/LessonView';
import { CreateLesson } from './components/Course/CreateLesson';

export const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lesson/:id" element={<LessonView />} />
        <Route path="/create-lesson" element={<CreateLesson />} />
      </Routes>
    </Layout>
  );
}; 