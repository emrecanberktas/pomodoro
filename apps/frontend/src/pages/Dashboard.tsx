import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuthStore } from "../store/authStore";
import clsx from "clsx";
import Countdown from "@/components/Countdown";
import { useAuth } from "@/util/useAuth";

const WORK_TIME = 0.5 * 60; // 25 dakika (saniye cinsinden)
const BREAK_TIME = 5 * 60; // 5 dakika (saniye cinsinden)

export default function Dashboard() {
  const { clearToken } = useAuthStore();
  const { savePomodoroMutation, pomodoroQuery } = useAuth();
  const [timeLeft, setTimeLeft] = useState(
    pomodoroQuery.data?.workTime || 25 * 60
  );
  const [isActive, setIsActive] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);

  const WORK_TIME = pomodoroQuery.data?.workTime || 25 * 60;
  const BREAK_TIME = pomodoroQuery.data?.breakTime || 5 * 60;

  useEffect(() => {
    let timer: number | undefined;
    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev: number) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsWorkPhase((prev) => !prev);
      setTimeLeft(isWorkPhase ? BREAK_TIME : WORK_TIME);
      setIsActive(false);
      // TODO : Ses dosyası seçilecek ve başlama ve bitişte farklı sesler çalınacak
      const audio = new Audio("/notification.mp3");
      audio.play();
      savePomodoroMutation.mutate({
        workTime: WORK_TIME,
        breakTime: BREAK_TIME,
      });
    }
    return () => clearInterval(timer);
  }, [
    isActive,
    timeLeft,
    isWorkPhase,
    WORK_TIME,
    BREAK_TIME,
    savePomodoroMutation,
  ]);

  const toggleTimer = () => setIsActive((prev) => !prev);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWorkPhase ? WORK_TIME : BREAK_TIME);
  };

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
        {Countdown({ seconds: timeLeft })}
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
          Reset
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
