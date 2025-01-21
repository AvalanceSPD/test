import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../utils/supabaseClient";
import styles from "./TestPages.module.css";

interface UserData {
  role: "student" | "teacher" | null;
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

  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');

  //: Fetch user data for seperate view to show
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

  //: no need to fetch data rn
  useEffect(() => {
    const fetchLessonData = async () => {
      setIsLoading(true);
      if (publicKey && connected) {
        try {
          const { data, error } = await supabase
            .from("lesson")
            .select("title, description")
            .eq("wallet_address", publicKey.toString())
            .single();

          if (error) throw error;
          setLessonData(data);
        } catch (err) {
          console.error("Error fetching lesson data:", err);
          setLessonData(null);
        }
      } else {
        setLessonData(null);
      }
      setIsLoading(false);
    };

    fetchLessonData();
  }, [publicKey, connected]);

  //: create new lesson data

  if (userData?.role === "student") {
    return (
      <div>
        <div className={styles.topContainer}>
          <div className={styles.Grid1}>
            <div className={styles.topLeft}>
              <img
                src="/1.jpg"
                alt="Placeholder"
                className={styles.topLeftImage}
              />
            </div>
            <div className={styles.topRight}>
              <h1>student role</h1>
              <h2>Agentic AI คืออะไร ?</h2>
              <p>
                หัวข้อนี้เราจะพาทุกคนมาทำความรู้จักกับคำว่า Agentic AI กัน (ฉบับ
                Software Engineer) ว่า Agentic AI คืออะไร
                มันเหมือนหรือแตกต่างกับ Generative AI
                ทั่วไปที่เราใช้งานกันทั่วไปอย่างไร หรือจริงๆ AI
                ในโลกนี้มันมีกี่ประเภทกันแน่ มันมีหลักการทำงานยังไงกันแน่
                มาฟังกันในหัวข้อฟังไมค์วันนี้กันครับ
              </p>
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <div className={styles.Grid2}>
            <div className={styles.leftContainer}>
              <iframe
                width="420"
                height="315"
                src="https://www.youtube.com/embed/H2jCHP1aKtE"
              ></iframe>
              <h2>คอลัมน์ซ้าย</h2>
              <p>เนื้อหาคอลัมน์ซ้าย (พื้นที่มากกว่า)</p>
            </div>
            <div className={styles.rightContainer}>
              <div className={styles.sessionContainer}>
                <p> test</p>
              </div>
              <div className={styles.documentContainer}></div>
              <div className={styles.quizContainer}></div>
              <h2>คอลัมน์ขวา</h2>
              <p>เนื้อหาคอลัมน์ขวา (พื้นที่น้อยกว่า)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userData?.role === "teacher") {
    return (
      <div>
        <div className={styles.topContainer}>
          <div className={styles.Grid1}>
            <div className={styles.topLeft}>
              <img
                src="/1.jpg"
                alt="Placeholder"
                className={styles.topLeftImage}
              />
              <input
              type="file"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={styles.input}
              />
            </div>
            <div className={styles.topRight}>
              <h1>Instructor role</h1>
              <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              />
              <br></br>
            <br></br>              
              <textarea placeholder="หัวข้อนี้เราจะพาทุกคนมาทำความรู้จักกับคำว่า Agentic AI กัน (ฉบับ Software Engineer) ว่า Agentic AI คืออะไร มันเหมือนหรือแตกต่างกับ Generative AI ทั่วไปที่เราใช้งานกันทั่วไปอย่างไร หรือจริงๆ AI ในโลกนี้มันมีกี่ประเภทกันแน่ มันมีหลักการทำงานยังไงกันแน่ มาฟังกันในหัวข้อฟังไมค์วันนี้กันครับ

                โดยในหัวข้อนี้เราจะพูดถึงเรื่อง
                1. AI hierarchy ทั้ง 4 อันคือ AI, Machine Learning, Deep Learning และ Generative AI ว่าแต่ละตัวมันคืออะไร และมีโจทย์ที่มองต่างกันอย่างไร
                2. ทำความเข้าใจพื้นฐานของ Agentic AI และ หลักการพื้นฐานของ Agentic AI
                3. Use case และความเคลื่อนไหวของเจ้าใหญ่ๆแต่ละเจ้า (ex. OpenAI, Claude, Gemini) ต่อ Agentic AI 
                4. Framework ที่สามารถพัฒนา Agentic AI แบบ code ได้
                5. เพิ่มเติมเรื่อง Reason กับ LLM 1 ใน แกนสำคัญที่ทำให้ Agentic AI ประสบความสำเร็จได้"></textarea>
              <div className={styles.topRightbtn}>
                {/* //: ไปหน้าformเปล่าๆ */}
                <button >create</button>
                {/* //: edit buttonให้โยงไปหน้าformเปล่าๆเเต่fillทุกอย่างเหมือนข้อมูลที่มีในฐานข้อมูล*/}
                <button>edit</button>
                {/* //: delete ให้ลบข้อมูลนี้บนDBเเล้วกลับไปหน้า instructor profile */}
                <button>delete</button>
                {/* //: calcle กลับไปหน้า profile */}
                <button>cancle</button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <div className={styles.Grid2}>
            <div className={styles.leftContainer}>
              <iframe
                width="420"
                height="315"
                src="https://www.youtube.com/embed/H2jCHP1aKtE"
              ></iframe>
              <h2>คอลัมน์ซ้าย</h2>
              <p>เนื้อหาคอลัมน์ซ้าย (พื้นที่มากกว่า)</p>
            </div>
            <div className={styles.rightContainer}>
              <div className={styles.sessionContainer}>
                <p> test</p>
              </div>
              <div className={styles.documentContainer}></div>
              <div className={styles.quizContainer}></div>
              <h2>คอลัมน์ขวา</h2>
              <p>เนื้อหาคอลัมน์ขวา (พื้นที่น้อยกว่า)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1></h1>
    </div>
  );
};

export default TestPages;
