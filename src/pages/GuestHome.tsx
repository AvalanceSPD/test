import React from 'react';
import Slider from 'react-slick';
import styles from './GuestHome.module.css';

const courses = [
  { id: 1, name: 'Course 1', instructor: 'Instructor 1', students: 30, description: 'This is a brief description of Course 1.', image: '/logo192.png' },
  { id: 2, name: 'Course 2', instructor: 'Instructor 2', students: 25, description: 'This is a brief description of Course 2.', image: '/logo192.png' },
  { id: 3, name: 'Course 3', instructor: 'Instructor 3', students: 20, description: 'This is a brief description of Course 3.', image: '/logo192.png' },
  { id: 4, name: 'Course 4', instructor: 'Instructor 4', students: 15, description: 'This is a brief description of Course 4.', image: '/logo192.png' },
  { id: 5, name: 'Course 5', instructor: 'Instructor 5', students: 10, description: 'This is a brief description of Course 5.', image: '/logo192.png' },
  { id: 6, name: 'Course 6', instructor: 'Instructor 6', students: 5, description: 'This is a brief description of Course 6.', image: '/logo192.png' },
  { id: 7, name: 'Course 7', instructor: 'Instructor 7', students: 8, description: 'This is a brief description of Course 7.', image: '/logo192.png' },
  { id: 8, name: 'Course 8', instructor: 'Instructor 8', students: 12, description: 'This is a brief description of Course 8.', image: '/logo192.png' },
];

const slides = [
  '/1.jpg',
  '/1.jpg',
  '/1.jpg',
];

export const GuestHome = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className={styles.container}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className={styles.slider}>
            <img src={slide} alt={`Slide ${index + 1}`} className={styles.slideImage} />
          </div>
        ))}
      </Slider>
      <div className={styles.courseWrapper}>
      <h1>Course</h1>
        <div className={styles.courseGrid}>
          {courses.map(course => (
            <div key={course.id} className={styles.courseCard}>
              <img src={course.image} alt={course.name} className={styles.courseImage} />
              <h2>{course.name}</h2>
              <p>Instructor: {course.instructor}</p>
              <p>Description: {course.description}</p>
              <div className={styles.infoContainer}>
                <span>Students: {course.students}</span>
                <button className={styles.infoButton}>Info</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};