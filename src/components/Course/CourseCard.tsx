import { Course } from '../../types';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <Link to={`/course/${course.id}`}>View Course</Link>
    </div>
  );
};