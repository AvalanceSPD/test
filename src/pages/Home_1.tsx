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

interface CourseData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

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
          .select("id, title, description, thumbnail");
        if (course) {
          setCourseData(course);
        } else {
          console.log("can't see any courses");
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };
    fetchCoursedata();
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

  // courseData.forEach((course) => {
  //   console.log(course.thumbnail);
  // });
  console.log(courseData);

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
              {courseData.map((course) => (
                <Col xs={24} sm={24} md={6}>
                  <div key={course.id} className={styles.divcard}>
                    <Card width={320} shaded bordered size="sm">
                      <img
                        // fit="contain"
                        src={course.thumbnail}
                        alt={course.title}
                        width={200}
                        height={160}
                        className={styles.imagecard}
                      />
                      <Card.Header as="h5">{course.title}</Card.Header>
                      <Card.Body>{course.description}</Card.Body>
                      <Card.Footer></Card.Footer>
                    </Card>
                    <button>info</button>
                  </div>
                </Col>
              ))}
            </Row>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default Home_1;
