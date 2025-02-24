import { useState, useEffect } from "react";
import { motion, AnimatePresence, easeInOut, animate } from "motion/react";
import { useAuthStore } from "../store/authStore";
import clsx from "clsx";

const WORK_TIME = 25 * 60; // 25 dakika (saniye cinsinden)
const BREAK_TIME = 5 * 60; // 5 dakika (saniye cinsinden)

export default function Dashboard() {
  const { clearToken } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);

  useEffect(() => {
    let timer: number | undefined;
    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsWorkPhase((prev) => !prev);
      setTimeLeft(isWorkPhase ? BREAK_TIME : WORK_TIME);
      setIsActive(false);
      // TODO : Ses dosyası seçilecek ve başlama ve bitişte farklı sesler çalınacak
      const audio = new Audio("/notification.mp3");
      audio.play();
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
      <p>{isWorkPhase ? "Work Time" : "Break Time"}</p>

      <div
        className={clsx(
          "w-[200px] h-[200px] rounded-full flex items-center justify-center mx-auto overflow-hidden",
          isWorkPhase ? "bg-[#ff6347]" : "bg-[#32cd32]"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={timeLeft}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ ease: "easeInOut" }}
            className="text-2xl font-bold color-white"
          >
            {formatTime(timeLeft)}
          </motion.div>
        </AnimatePresence>
      </div>

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
          {isActive ? "Stop" : "Start"}
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
