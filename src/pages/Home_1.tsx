import React, { use, useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../utils/supabaseClient";
import styles from "./Home_1.module.css";
import Slider from "react-slick";
import { Grid, Row, Col, Card, Text, Button, TagGroup, Tag, Dropdown} from "rsuite";
import "rsuite/Grid/styles/index.css";
import "rsuite/Row/styles/index.css";
import "rsuite/Col/styles/index.css";
import "rsuite/Panel/styles/index.css";
import "rsuite/PanelGroup/styles/index.css";
import 'rsuite/Dropdown/styles/index.css';
import 'rsuite/Card/styles/index.css';
import 'rsuite/CardGroup/styles/index.css';
import 'rsuite/Button/styles/index.css';

interface UserData {
  // role: "student" | "teacher" | null;
  username: string;
}

interface CourseData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

interface rpcData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  ins_name: string;
}

const slides = ["/1.jpg", "/2.jpg", "/3.jpg"];

const items = [
  <Dropdown.Item key={1} onClick={() => handleSortAZ()}>A ~ Z</Dropdown.Item>,
  <Dropdown.Item key={2} onClick={() => handleSortByDate()}>Release Date</Dropdown.Item>
];

function handleSortAZ() {
  console.log('A ~ Z');
}

function handleSortByDate() {
  console.log('Release Date');
}

const Home_1 = () => {
  // const Home_1: React.FC<CourseDataProps> = ({ items }) => {

  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [rpcData, setRpcData] = useState<rpcData[]>([]);
  const [sort, setSort] = useState({keyToSort: "MAKE", direction: "asc"});


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
// console.log(courseData);

  //: try postgreSQL
  useEffect(() => {
    const fetchCoursedata = async () => {
      try {
        const { data:rpcData, error:rpcError } = await supabase
          .rpc('get_relative_course_data')
        if (error) console.error(error)
        // else console.log(rpcData)
        //? json format
        //?   {
        //?      "id": int,
        //?      "title": "",
        //?      "description": "",
        //?      "thumbnail": "",
        //?      "ins_name": ""
        //?    },
        if (rpcData) {
          setRpcData(rpcData);          
        } else {
          console.log("can't see any rpc");
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };
    fetchCoursedata();
  }, []);
  // console.log(rpcData);

  //: fetch users data function
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      if (publicKey && connected) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("username")
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

  const handlecoursebtn = async (course_id: number) => {
    console.log(course_id);
    navigate(`/course/${course_id}`);
  }

  if (isLoading) {
    return <div className={styles.loading}>กำลังโหลด...</div>;
  }

  //= หน้า Home สำหรับนักเรียน
  // if (userData?.role === "student") {
  //   return (
  //     <div className={styles.container}>
  //       <div className={styles.content}>
  //         <h1 className={styles.title}>ยินดีต้อนรับ {userData.username}</h1>
  //         <div className={styles.studentDashboard}>
  //           <div className={styles.section}>
  //             <h2>คอร์สเรียนของฉัน</h2>
  //             {/* แสดงรายการคอร์สที่ลงทะเบียน */}
  //             <div className={styles.courseGrid_v1}>
  //               {/* ตัวอย่างคอร์ส */}
  //               <div className={styles.courseCard_v1}>
  //                 <h3>คอร์ส A</h3>
  //                 <button onClick={() => navigate("/course/1")}>
  //                   เข้าเรียน
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //           <div className={styles.section}>
  //             <h2>คอร์สแนะนำ</h2>
  //             {/* แสดงคอร์สแนะนำ */}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  //= หน้า Home สำหรับอาจารย์
  // if (userData?.role === "teacher") {
  //   return (
  //     <div className={styles.container}>
  //       <div className={styles.content}>
  //         <h1 className={styles.title}>
  //           ยินดีต้อนรับ อาจารย์ {userData.username}
  //         </h1>
  //         <div className={styles.teacherDashboard}>
  //           <div className={styles.section}>
  //             <h2>คอร์สที่สอน</h2>
  //             <button
  //               className={styles.createButton}
  //               onClick={() => navigate("/create-lesson")}
  //             >
  //               สร้างคอร์สใหม่
  //             </button>
  //             {/* แสดงรายการคอร์สที่สอน */}
  //             <div className={styles.courseGrid_v1}>
  //               {/* ตัวอย่างคอร์ส */}
  //               <div className={styles.courseCard_1}>
  //                 <h3>คอร์ส X</h3>
  //                 <button onClick={() => navigate("/lessons/1")}>
  //                   จัดการคอร์ส
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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
        <div className={styles.courseheader}>
          <div className={styles.coursediv1}>
              <h1>Course</h1>
          </div>
          <div className={styles.coursediv2}>
              <Dropdown title="Sort" placement="bottomEnd">
                {items}
              </Dropdown>
          </div>
        </div>
        <div className={styles.course_card}>
          <Grid fluid>
            <Row className="show-grid">
              {rpcData.map((course) => (
                <Col key={course.id} sm={12} lg={6} xxl={6}>
                  <div>
                    <Card shaded bordered size="sm" className={styles.divcard}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        width={200}
                        height={160}
                        className={styles.imagecard}
                        sizes="sm"
                      />
                      <Card.Header as="h4">{course.title}</Card.Header>
                      {/* <Card.Body>{course.description}</Card.Body> */}
                      <div className={styles.cardbottomdiv}>
                        <div>
                          <p>ผู้สอน : {course.ins_name}</p>
                        </div>
                        <div>
                          <Button color="violet" appearance="primary" onClick={() => handlecoursebtn(course.id)} className={styles.cardbtn}>
                            Violet
                          </Button>
                        </div>
                      </div>
                    </Card>
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
