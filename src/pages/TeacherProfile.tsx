import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supabase } from '../utils/supabaseClient';
import styles from './TeacherProfile.module.css';
import { CopyButton } from '../components/compo/CopyButton'
import { Grid, Row, Col, Card, Button} from "rsuite";
import "rsuite/Grid/styles/index.css";
import "rsuite/Row/styles/index.css";
import "rsuite/Col/styles/index.css";
import "rsuite/Panel/styles/index.css";
import "rsuite/PanelGroup/styles/index.css";
import 'rsuite/Dropdown/styles/index.css';
import 'rsuite/Card/styles/index.css';
import 'rsuite/CardGroup/styles/index.css';
import 'rsuite/Button/styles/index.css';

interface profiledata {
  wallet_address: string,
  username: string,
  ins_name: string,
  is_instructor: boolean,
  is_student: boolean
}

interface rpcData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  ins_name: string;
}

const TeacherProfile = () => {
  const { publicKey,connected, disconnect } = useWallet();
  const navigate = useNavigate();
  const [profiledata, setProfiledata] = useState<profiledata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rpcData, setRpcData] = useState<rpcData[]>([]);

  useEffect(() => {
    
    const fetchUserProfile = async () => {
      if (!publicKey) {
          // navigate('/home_1');
          // alert("fuck off")
          return;
        }
        
        try {
          setIsLoading(true);
          setError(null);
          
          // const walletAddress = publicKey.toString();
          const { data, error: fetchError } = await supabase
          .rpc('check_role_in_navebar', {
          p_public_key:publicKey
        })
          //= json format
          //=   {
          //=      "is_instructor": boolean,
          //=      "is_student": boolean,
          //=      "ins_name": string,
          //=      "username": string,
          //=      "wallet_address": string
          //=    }
        if (fetchError) {
          throw fetchError;
        }
        if (data) {
          setProfiledata(data);

        } else {
          setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เนื่องจากไม่ใช่ผู้สอน');
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        }

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [publicKey, navigate]);

    //: postgreSQL
    useEffect(() => {
      if (publicKey) {
        const fetchCoursedata = async () => {
          try {
            const { data:rpcData, error:rpcError } = await supabase
              .rpc('get_ins_course', {
                p_public_key:publicKey
              })
            if (rpcError) console.error(rpcError)
            // else console.log(rpcData)
            //= json format
            //=   {
            //=      "id": int,
            //=      "title": "",
            //=      "description": "",
            //=      "thumbnail": "",
            //=      "ins_name": ""
            //=    }
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
      }
    }, [publicKey]);
    
    const handlecoursebtn = async (course_id: number) => {
      console.log(course_id);
      navigate(`/course/${course_id}`);
    }  
        // console.log('this is public key: ',publicKey);
  return (
    <div className={styles.container}>
      <div className={styles.backgroundSection}>
        <img src="/2.jpg" alt="Background" />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.courseheader}>
            <div>
              <h1>Course manager</h1>
            </div>
            <div className={styles.createbtn}>
              <button className={styles.createButton}>Create lesson</button>
            </div>
          </div>
          
          <div className={styles.lessonGrid}>
            {/* Grid สำหรับ lessons */}
            <Grid fluid>
            <Row className="show-grid">
              {rpcData.map((course) => (
                <Col key={course.id} sm={24} lg={12} xxl={8}>
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
                          <p>Instructor : {course.ins_name}</p>
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

        <div className={styles.profileSidebar}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                <img src="/3.jpg" alt="Profile" className={styles.avatar} />
              </div>
              <h2>{profiledata?.ins_name || 'Instructor name'}</h2>
              <p className={styles.subtitle}>subtitle</p>
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.detailItem}>
                <span className={styles.label}>ชื่อผู้ใช้:</span>
                <span className={styles.value}>{profiledata?.username}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>ชื่อเต็ม:</span>
                <span className={styles.value}>{profiledata?.ins_name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>บทบาท:</span>
                <span className={styles.value}>ผู้สอน</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Public key:</span>
                {/* <span className={styles.value}>{profiledata?.wallet_address}</span> */}
                {profiledata?.wallet_address &&<CopyButton text={profiledata?.wallet_address} maxLength={10} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
