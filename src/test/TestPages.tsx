import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../utils/supabaseClient';
import styles from './TestPages.module.css';

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
        <div >
            <div className={styles.topContainer}>
                <div className={styles.Grid1}>
                    <div className={styles.topLeft}>
                    <img src='/1.jpg' alt='Placeholder' className={styles.topLeftImage} />
                    </div>
                    <div className={styles.topRight}>
                        <h2>Agentic AI คืออะไร ?</h2>
                        <p>หัวข้อนี้เราจะพาทุกคนมาทำความรู้จักกับคำว่า Agentic AI กัน (ฉบับ Software Engineer) ว่า Agentic AI คืออะไร มันเหมือนหรือแตกต่างกับ Generative AI ทั่วไปที่เราใช้งานกันทั่วไปอย่างไร หรือจริงๆ AI ในโลกนี้มันมีกี่ประเภทกันแน่ มันมีหลักการทำงานยังไงกันแน่ มาฟังกันในหัวข้อฟังไมค์วันนี้กันครับ
                        </p>
                    </div>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <div className={styles.Grid2}>
                    <div className={styles.leftContainer}>
                      <iframe width="420" height="315"
                      src="https://www.youtube.com/embed/H2jCHP1aKtE"></iframe>
                      <h2>คอลัมน์ซ้าย</h2>
                      <p>เนื้อหาคอลัมน์ซ้าย (พื้นที่มากกว่า)</p>
                    </div>
                    <div className={styles.rightContainer}>
                      <div className={styles.sessionContainer}> 
                        <p> test</p>
                      </div>
                      <div className={styles.documentContainer}> 
                      </div>
                      <div className={styles.quizContainer}> 
                      </div>
                      <h2>คอลัมน์ขวา</h2>
                      <p>เนื้อหาคอลัมน์ขวา (พื้นที่น้อยกว่า)</p>
                    </div>
                </div>
            </div>
        </div>
      );
};

export default TestPages;