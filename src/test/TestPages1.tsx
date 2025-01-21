import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../utils/supabaseClient';
import styles from './TestPage1.module.css';

interface UserData {
    role: 'student' | 'teacher' | null;
    username: string;
}

interface LessonData {
    title: string;
    description: string;
    // image: string;
}

const TestPages = () => {
    const navigate = useNavigate();
    const { publicKey, connected } = useWallet();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [lessonData, setLessonData] = useState<LessonData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
        const fetchUserData = async () => {
          setIsLoading(true);
          if (publicKey && connected) {
            try {
              const { data, error } = await supabase
                .from('users')
                .select('role, username')
                .eq('wallet_address', publicKey.toString())
                .single();
    
              if (error) throw error;
              setUserData(data);
            } catch (err) {
              console.error('Error fetching user data:', err);
              setUserData(null);
            }
          } else {
            setUserData(null);
          }
          setIsLoading(false);
        };
    
        fetchUserData();
      }, [publicKey, connected]);

    useEffect(() => {
    const fetchLessonData = async () => {
        setIsLoading(true);
        if (publicKey && connected) {
        try {
            const { data, error } = await supabase
            .from('lesson')
            .select('title, description')
            .eq('wallet_address', publicKey.toString())
            .single();

            if (error) throw error;
            setLessonData(data);
        } catch (err) {
            console.error('Error fetching lesson data:', err);
            setLessonData(null);
        }
        } else {
        setLessonData(null);
        }
        setIsLoading(false);
    };

    fetchLessonData();
    }, [publicKey, connected]);

    return (
        <div className={styles.container}>
            {/* ส่วนบนสุด - รูปภาพและชื่อบทเรียน */}
            <div className={styles.header}>
                <div className={styles.thumbnailContainer}>
                    <img src='/placeholder.jpg' alt='Lesson thumbnail' className={styles.thumbnail} />
                </div>
                <div className={styles.lessonTitle}>
                    <h2>Lesson name</h2>
                    <input type="text" placeholder="lesson description" className={styles.descriptionInput} />
                </div>
            </div>

            {/* ส่วนเนื้อหาหลัก */}
            <div className={styles.mainContent}>
                {/* ส่วนซ้าย - วิดีโอและรายละเอียด */}
                <div className={styles.leftSection}>
                    <div className={styles.videoContainer}>
                        <div className={styles.videoPlaceholder}>
                            <div className={styles.playButton}>▶</div>
                        </div>
                    </div>
                    <div className={styles.lessonInfo}>
                        <h2>ภาพรวม คู่มือ</h2>
                        <h3>ปรัชญาสังคมการเมือง</h3>
                        <p>สังคม ในที่นี้หมายถึง หมู่ปวงชน หรือคนจำนวนหนึ่งที่มีความสัมพันธ์ต่อเนื่องกัน...</p>
                        <div className={styles.instructorInfo}>
                            <p>Instructor name</p>
                            <p>time - date month year</p>
                        </div>
                    </div>
                </div>

                {/* ส่วนขวา - Navigate */}
                <div className={styles.rightSection}>
                    <h3>Navigate</h3>
                    
                    {/* Session */}
                    <div className={styles.navigationSection}>
                        <h4>Session</h4>
                        {[1, 2, 3, 4].map(num => (
                            <div key={num} className={styles.sessionItem}>
                                <div className={styles.sessionHeader}>
                                    <span>session {num}</span>
                                    <span>Header</span>
                                    <button>{num === 4 ? '+' : '-'}</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Document */}
                    <div className={styles.navigationSection}>
                        <h4>Document</h4>
                        {[1, 2, 3].map(num => (
                            <div key={num} className={styles.documentItem}>
                                <span>Document {num}</span>
                                <button>View</button>
                            </div>
                        ))}
                    </div>

                    {/* Quiz */}
                    <div className={styles.navigationSection}>
                        <h4>Quiz</h4>
                        {[1, 2, 3, 4].map(num => (
                            <div key={num} className={styles.quizItem}>
                                <span>session {num}</span>
                                <button>Quiz</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPages;