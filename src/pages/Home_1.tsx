import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../utils/supabaseClient";
import styles from "./Home_1.module.css";
import Slider from "react-slick";
import { Grid, Row, Col, Card, Text, Button, TagGroup, Tag } from "rsuite";
import "rsuite/Grid/styles/index.css";
import "rsuite/Row/styles/index.css";
import "rsuite/Col/styles/index.css";
import "rsuite/Panel/styles/index.css";
import "rsuite/PanelGroup/styles/index.css";

interface UserData {
  role: "student" | "teacher" | null;
  username: string;
}

interface Map_role {
  role: number;
}

interface InstructorData {
  name: string;
}

interface CourseData {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  create_by: number;
}

interface SumData {
  users: UserData[];
  role: Map_role[];
  ins_name: InstructorData[];
  course: CourseData[];
}

const courseimage = "/logo192.png";

interface CourseDataProps {
  items: string;
}
// const courseArray = [{}];

const courses = [
  {
    id: 1,
    name: "Course 1",
    instructor: "Instructor 1",
    students: 30,
    description: "This is a brief description of Course 1.",
    image: "/logo192.png",
  },
  {
    id: 2,
    name: "Course 2",
    instructor: "Instructor 2",
    students: 25,
    description: "This is a brief description of Course 2.",
    image: "/logo192.png",
  },
  {
    id: 3,
    name: "Course 3",
    instructor: "Instructor 3",
    students: 20,
    description: "This is a brief description of Course 3.",
    image: "/logo192.png",
  },
  {
    id: 4,
    name: "Course 4",
    instructor: "Instructor 4",
    students: 15,
    description: "This is a brief description of Course 4.",
    image: "/logo192.png",
  },
  {
    id: 5,
    name: "Course 5",
    instructor: "Instructor 5",
    students: 10,
    description: "This is a brief description of Course 5.",
    image: "/logo192.png",
  },
  {
    id: 6,
    name: "Course 6",
    instructor: "Instructor 6",
    students: 5,
    description: "This is a brief description of Course 6.",
    image: "/logo192.png",
  },
  {
    id: 7,
    name: "Course 7",
    instructor: "Instructor 7",
    students: 8,
    description: "This is a brief description of Course 7.",
    image: "/logo192.png",
  },
  {
    id: 8,
    name: "Course 8",
    instructor: "Instructor 8",
    students: 12,
    description: "This is a brief description of Course 8.",
    image: "/logo192.png",
  },
];

const slides = ["/1.jpg", "/1.jpg", "/1.jpg"];

const Home_1 = () => {
  // const Home_1: React.FC<CourseDataProps> = ({ items }) => {

  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData[]>([]);

  // : slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  //: fetch course data function
  useEffect(() => {
    const fetchCoursedata = async () => {
      try {
        //> supabase api for fetch related course data
        const { data: course, error } = await supabase
          .from("course")
          .select("id, title, description, thumbnail, create_by");
        if (course) {
          setCourseData(course);
        } else {
          console.log("can't see any courses");
        }
      } catch (error) {}
    };
    fetchCoursedata();
  }, []);

  //: fetch instructor data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: instructor_list, error } = await supabase
          .from("instructor_list")
          .select("*")

          // Filters
          .eq("id", "Equal to")
          .gt("column", "Greater than")
          .lt("column", "Less than")
          .gte("column", "Greater than or equal to")
          .lte("column", "Less than or equal to")
          .like("column", "%CaseSensitive%")
          .ilike("column", "%CaseInsensitive%")
          .is("column", null)
          .in("column", ["Array", "Values"])
          .neq("column", "Not equal to")

          // Arrays
          .contains("array_column", ["array", "contains"])
          .containedBy("array_column", ["contained", "by"]);
      } catch (error) {}
    };
    fetchData();
  }, []);

  //: fetch users data function
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      if (publicKey && connected) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("role, username")
            .eq("wallet_address", publicKey.toString())
            .single();

          if (error) throw error;
          setUserData(data);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [publicKey, connected]);

  if (isLoading) {
    return <div className={styles.loading}>กำลังโหลด...</div>;
  }

  //= หน้า Home สำหรับนักเรียน
  if (userData?.role === "student") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>ยินดีต้อนรับ {userData.username}</h1>
          <div className={styles.studentDashboard}>
            <div className={styles.section}>
              <h2>คอร์สเรียนของฉัน</h2>
              {/* แสดงรายการคอร์สที่ลงทะเบียน */}
              <div className={styles.courseGrid_v1}>
                {/* ตัวอย่างคอร์ส */}
                <div className={styles.courseCard_v1}>
                  <h3>คอร์ส A</h3>
                  <button onClick={() => navigate("/course/1")}>
                    เข้าเรียน
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <h2>คอร์สแนะนำ</h2>
              {/* แสดงคอร์สแนะนำ */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  //= หน้า Home สำหรับอาจารย์
  if (userData?.role === "teacher") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            ยินดีต้อนรับ อาจารย์ {userData.username}
          </h1>
          <div className={styles.teacherDashboard}>
            <div className={styles.section}>
              <h2>คอร์สที่สอน</h2>
              <button
                className={styles.createButton}
                onClick={() => navigate("/create-lesson")}
              >
                สร้างคอร์สใหม่
              </button>
              {/* แสดงรายการคอร์สที่สอน */}
              <div className={styles.courseGrid_v1}>
                {/* ตัวอย่างคอร์ส */}
                <div className={styles.courseCard_1}>
                  <h3>คอร์ส X</h3>
                  <button onClick={() => navigate("/lessons/1")}>
                    จัดการคอร์ส
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //= หน้า Home สำหรับ Guest
  return (
    <div className={styles.container_v1}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className={styles.slider}>
            <img
              src={slide}
              alt={`Slide ${index + 1}`}
              className={styles.slideImage}
            />
          </div>
        ))}
      </Slider>
      <div className={styles.courseWrapper}>
        <h1>Course</h1>
        <div className={styles.course_card}>
          <Grid fluid>
            <Row className="show-grid">
              <Col xs={24} sm={24} md={8}>
                <div className={styles.divcard}>
                  <Card width={320} shaded>
                    <img
                      src="https://images.unsplash.com/photo-1576606539605-b2a44fa58467?q=80&w=1974"
                      alt="Shadow"
                      width={200}
                      height={300}
                      // sizes=""
                      className={styles.imagecard}
                    />
                    <Card.Header as="h5">Shadow</Card.Header>
                    <Card.Body>
                      Meet Shadow, a spirited little explorer with a heart full
                      of adventure! This charming pup loves to roam the fields,
                      soaking up the sights and sounds of nature.
                    </Card.Body>
                    <Card.Footer>
                      <TagGroup>
                        <Tag size="sm">🐶 Dog</Tag>
                        <Tag size="sm">☀️ Sunny</Tag>
                        <Tag size="sm">🌈 Rainbow</Tag>
                      </TagGroup>
                    </Card.Footer>
                  </Card>
                </div>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <div className={styles.divcard}>
                  <Card width={320} shaded>
                    <img
                      src="https://images.unsplash.com/photo-1576606539605-b2a44fa58467?q=80&w=1974"
                      alt="Shadow"
                      width={200}
                      height={300}
                      className={styles.imagecard}
                    />
                    <Card.Header as="h5">Shadow</Card.Header>
                    <Card.Body>
                      Meet Shadow, a spirited little explorer with a heart full
                      of adventure! This charming pup loves to roam the fields,
                      soaking up the sights and sounds of nature.
                    </Card.Body>
                    <Card.Footer>
                      <TagGroup>
                        <Tag size="sm">🐶 Dog</Tag>
                        <Tag size="sm">☀️ Sunny</Tag>
                        <Tag size="sm">🌈 Rainbow</Tag>
                      </TagGroup>
                    </Card.Footer>
                  </Card>
                </div>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <div className={styles.divcard}>
                  <Card width={320} shaded>
                    <img
                      src="https://images.unsplash.com/photo-1576606539605-b2a44fa58467?q=80&w=1974"
                      alt="Shadow"
                      width={200}
                      height={300}
                      className={styles.imagecard}
                    />
                    <Card.Header as="h5">Shadow</Card.Header>
                    <Card.Body>
                      Meet Shadow, a spirited little explorer with a heart full
                      of adventure! This charming pup loves to roam the fields,
                      soaking up the sights and sounds of nature.
                    </Card.Body>
                    <Card.Footer>
                      <TagGroup>
                        <Tag size="sm">🐶 Dog</Tag>
                        <Tag size="sm">☀️ Sunny</Tag>
                        <Tag size="sm">🌈 Rainbow</Tag>
                      </TagGroup>
                    </Card.Footer>
                  </Card>
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
        <div className={styles.courseGrid}>
          {courseData.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              <img
                src={courseimage}
                alt={course.title}
                className={styles.courseImage}
              />
              <h2>{course.title}</h2>
              <p>Instructor: {/* {course.instructor}*/}</p>
              <p>Description: {course.description}</p>
              <div className={styles.infoContainer}>
                <span>Students: {/* {course.students}*/}</span>
                <button className={styles.infoButton}>Info</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home_1;
