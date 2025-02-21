import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuthStore } from "../store/authStore";

const WORK_TIME = 25 * 60; // 25 dakika (saniye cinsinden)
const BREAK_TIME = 5 * 60; // 5 dakika (saniye cinsinden)

export default function Dashboard() {
  const { clearToken } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);

  // Sayaç mantığı
  useEffect(() => {
    let timer: number | undefined;
    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Faz geçişi
      setIsWorkPhase((prev) => !prev);
      setTimeLeft(isWorkPhase ? BREAK_TIME : WORK_TIME);
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, isWorkPhase]);

  // Süreyi dakika:saniye formatına çevir
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Başlat/Durdur ve Sıfırla fonksiyonları
  const toggleTimer = () => setIsActive((prev) => !prev);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWorkPhase ? WORK_TIME : BREAK_TIME);
  };

  // Çıkış yapma
  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("token");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Hoş Geldiniz!</h1>
      <p>{isWorkPhase ? "Çalışma Zamanı" : "Mola Zamanı"}</p>

      {/* Animasyonlu Pomodoro Sayaç */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
          rotate: isActive ? [0, 2, -2, 0] : 0,
        }}
        transition={{
          duration: 1,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          backgroundColor: isWorkPhase ? "#ff6347" : "#32cd32",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "20px auto",
          color: "white",
          fontSize: "2rem",
          fontWeight: "bold",
        }}
      >
        {formatTime(timeLeft)}
      </motion.div>

      {/* Kontrol Butonları */}
      <div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          style={{
            padding: "10px 20px",
            margin: "0 10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isActive ? "Durdur" : "Başlat"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          style={{
            padding: "10px 20px",
            margin: "0 10px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Sıfırla
        </motion.button>
      </div>

      {/* Çıkış Yap Butonu */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Çıkış Yap
      </motion.button>
    </div>
  );
}
