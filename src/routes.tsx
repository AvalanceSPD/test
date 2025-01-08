import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { CourseDetail } from './components/Course/CourseDetail';
import { CreateCourse } from './components/Course/CreateCourse';

export const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/create-course" element={<CreateCourse />} />
      </Routes>
    </Layout>
  );
}; 