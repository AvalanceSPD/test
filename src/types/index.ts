export interface User {
    id: string;
    wallet_address: string;
    username: string;
    role: 'student' | 'teacher';
  }
  
  export interface Course {
    id: string;
    title: string;
    description: string;
    teacher_id: string;
    created_at: string;
  }
  
  export interface Enrollment {
    id: string;
    student_id: string;
    course_id: string;
    grade?: string;
    completed: boolean;
    created_at: string;
  }