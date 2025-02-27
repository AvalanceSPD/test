import React, { use, useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../utils/supabaseClient";
import styles from "./Home_1.module.css";
import Slider from "react-slick";
import { Grid, Row, Col, Card, Text, Button, Dropdown} from "rsuite";
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
  create_at: string;
}

interface rpcData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  ins_name: string;
  create_at: string;
}

const slides = ["/1.jpg", "/2.jpg", "/3.jpg"];

const Home_1 = () => {
  // const Home_1: React.FC<CourseDataProps> = ({ items }) => {

  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [rpcData, setRpcData] = useState<rpcData[]>([]);
  const [originalData, setOriginalData] = useState<rpcData[]>([]);
  const [sort, setSort] = useState({keyToSort: "MAKE", direction: "asc"});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('');


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
          .select("id, title, description, thumbnail, create_at");
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

  //: postgreSQL
  useEffect(() => {
    const fetchCoursedata = async () => {
      try {
        const { data: rpcData, error } = await supabase
          .rpc('get_relative_course_data');
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
          setOriginalData(rpcData);
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

  const handleSortByDateNew = () => {
    const sortedData = [...rpcData].sort((a, b) => {
        return new Date(b.create_at).getTime() - new Date(a.create_at).getTime(); // จัดเรียงจากใหม่ไปเก่า
    });
    setRpcData(sortedData);
    setSortBy('Latest Date');
};

const handleSortByDateOld = () => {
  const sortedData = [...rpcData].sort((a, b) => {
      return new Date(a.create_at).getTime() - new Date(b.create_at).getTime(); // จัดเรียงจากใหม่ไปเก่า
  });
  setRpcData(sortedData);
  setSortBy('Released Date');
};

const handleSortAZ = () => {
    const sortedData = [...rpcData].sort((a, b) => {
        return a.title.localeCompare(b.title); // จัดเรียงตามชื่อจาก A ถึง Z
    });
    setRpcData(sortedData);
    setSortBy('A ~ Z');
};

const handleSortZA = () => {
    const sortedData = [...rpcData].sort((a, b) => {
        return b.title.localeCompare(a.title); // จัดเรียงตามชื่อจาก Z ถึง A
    });
    setRpcData(sortedData);
    setSortBy('Z ~ A');
};

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === '') {
        setRpcData(originalData); // คืนค่าข้อมูลต้นฉบับเมื่อไม่มีการค้นหา
    } else {
        const filteredData = originalData.filter(course => 
            course.title.toLowerCase().includes(value.toLowerCase()) || // ค้นหาชื่อคอร์ส
            course.ins_name.toLowerCase().includes(value.toLowerCase()) // ค้นหาชื่อผู้สอน
        );
        setRpcData(filteredData);
    }
};

const items = [
  <Dropdown.Item key={1} onClick={handleSortAZ}>A ~ Z</Dropdown.Item>,
  <Dropdown.Item key={2} onClick={handleSortZA}>Z ~ A</Dropdown.Item>,
  <Dropdown.Item key={3} onClick={handleSortByDateNew}>Latest Date</Dropdown.Item>,
  <Dropdown.Item key={4} onClick={handleSortByDateOld}>Released Date</Dropdown.Item>,
];

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
    // console.log(course_id);
    navigate(`/course/${course_id}`);
  }

  if (isLoading) {
    return <div className={styles.loading}>กำลังโหลด...</div>;
  }

  //= หน้า Home สำหรับ Guest
  return (
    <div className={styles.container}>
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
      <div className={styles.container_v1}>
        <div className={styles.courseWrapper}>
          <div className={styles.courseheader}>
            <div className={styles.coursediv1}>
                <h1>Course</h1>
            </div>
            <div className={styles.coursediv2}>
                <div className={styles.sortSearchContainer}>
                  <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchTerm} 
                      onChange={handleSearch}
                      className={styles.searchInput}
                    />
                  <Dropdown title={`Sort by: ${sortBy || 'Select'}`} placement="bottomEnd">
                      {items}
                  </Dropdown>
                </div>
            </div>
          </div>
          <div className={styles.course_card}>
            <Grid fluid>
              <Row className="show-grid">
                {rpcData.map((course) => (
                  <Col sm={12} lg={6} xxl={6} key={course.id}>
                    <Card shaded bordered size="sm" className={styles.divcard}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className={styles.imagecard}
                      />
                      <div className={styles.cardContent}>
                      <Card.Header as="h3" className={styles.cardTitle}>{course.title}</Card.Header>
                        <div className={styles.instructorName}>
                          <p className={styles.cardText}>Instructer : {course.ins_name}</p>
                          <p className={styles.cardText}>Create at: {course.create_at ? new Date(course.create_at).toLocaleDateString() : 'ไม่ระบุวันที่'}</p>
                        </div>
                      </div>
                        <div className={styles.cardbottomdiv}>
                          <div>
                            <Button 
                              color="violet" 
                              appearance="primary" 
                              onClick={() => handlecoursebtn(course.id)} 
                              className={styles.cardbtn}
                            >
                              Info
                            </Button>
                          </div>
                        </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home_1;
