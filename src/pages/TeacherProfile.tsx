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
import EditProfileModal from '../components/Course/Profile/EditProfileModal';

interface profiledata {
  wallet_address: string,
  username: string,
  ins_name: string,
  is_instructor: boolean,
  is_student: boolean
  image_profile: string;
}

interface rpcData {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  ins_name: string;
  create_at: string;
}

interface users_id {
  id: string;
}

const TeacherProfile = () => {
  const { publicKey,connected, disconnect } = useWallet();
  const navigate = useNavigate();
  const [profiledata, setProfiledata] = useState<profiledata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rpcData, setRpcData] = useState<rpcData[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState('/3.jpg');
  const [profile_img, setProfileImg] = useState<string | null>(null);
  const [usersID, setUserID] = useState<users_id | null>(null);

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
          setProfileImg(data.image_profile)
        } else {
          setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เนื่องจากไม่ใช่ผู้สอน');
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        }

        const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', publicKey);
            if (users) setUserID(users[0].id);

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

        useEffect(() => {
          const fetchBackgroundImage = async () => {
              const { data} = await supabase
                  .storage
                  .from('slide_img') // เปลี่ยนเป็นชื่อ bucket ของคุณ
                  .getPublicUrl('image_2025-03-02_235106686.png'); // เปลี่ยนเป็น path ของภาพที่ต้องการ
  
              if (error) {
                  console.error('Error fetching image:', error);
              } else {
                  setBackgroundImage(data.publicUrl); // ตั้งค่า URL ของภาพ
              }
          };
  
          fetchBackgroundImage();
      }, []);
      
      const handlecreatebtn = async () => {
        navigate('/createcourse');
      }  

  const handleSaveProfile = async (newName: string, newImageUrl: string) => {
    try {
      //: อัพเดทชื่อใน database สำหรับ student
      const { error: updateError } = await supabase
        .from('instructors_list')
        .update({ ins_name: newName })
        .eq('ins_id', usersID);

      if (updateError) throw updateError;

      setProfileImage(newImageUrl);
      setProfiledata(prev => prev ? {
        ...prev,
        ins_name: newName
      } : null);

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className={styles.container}>
        <div className={styles.backgroundSection}>
          {backgroundImage && <img src={backgroundImage} alt="Background" />}
        </div>
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.courseheader}>
            <div>
              <h1>Course manager</h1>
            </div>
            <div className={styles.createbtn}>
              <button className={styles.createButton} onClick={handlecreatebtn}>Create lesson</button>
            </div>
          </div>
              {/* Grid สำหรับ lessons */}
              <div className={styles.course_card}>
                <Grid fluid>
                <Row className="show-grid">
                {rpcData.map((course) => (
                <Col sm={24} lg={12} xxl={6} key={course.id}>
                  <Card shaded bordered size="sm" className={styles.divcard}>
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className={styles.imagecard}
                    />
                    <div className={styles.cardContent}>
                    <Card.Header as="h4" className={styles.cardTitle}>{course.title}</Card.Header>
                      <div className={styles.instructorName}>
                        <p className={styles.cardText}>Instructer : {course.ins_name}</p>
                        <p className={styles.cardText}>Create at: {course.create_at ? new Date(course.create_at).toLocaleDateString() : 'ไม่ระบุวันที่'}</p>
                      </div>
                    </div>
                      <div className={styles.cardbottomdiv}>
                        <div>
                          <Button
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

        <div className={styles.profileSidebar}>
          <div className={styles.profileCard}>
            <button 
              className={styles.editButton}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </button>
            <div className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                <img src={profile_img || '/default_profile.png'} alt="Profile" className={styles.avatar} />
              </div>
              <h2>{profiledata?.ins_name || 'Instructor name'}</h2>
              <p className={styles.subtitle}>subtitle</p>
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Username:</span>
                <span className={styles.value}>{profiledata?.username}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{profiledata?.ins_name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Role:</span>
                <span className={styles.value}>Instructer</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Public key:</span>
                {/* <span className={styles.value}>{profiledata?.wallet_address}</span> */}
                {profiledata?.wallet_address &&<CopyButton text={profiledata?.wallet_address} maxLength={10} />}
              </div>
            </div>
          </div>

          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            currentName={profiledata?.ins_name || ''}
            currentImage={profileImage}
            walletAddress={profiledata?.wallet_address || ''}
            onSave={handleSaveProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
