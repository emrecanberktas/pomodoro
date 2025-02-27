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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Pomodoro Timer
          </h1>
        </div>

        {/* Timer Section */}
        <div className="flex flex-col items-center">
          <p className="text-lg font-medium mb-6 text-slate-300">
            {isWorkPhase ? "Focus Session" : "Break Time"}
          </p>

          {/* Timer Circle */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={clsx(
              "w-64 h-64 rounded-full flex items-center justify-center relative mb-10",
              "border-8 shadow-lg transition-colors duration-500",
              isWorkPhase
                ? "border-rose-500/20 bg-rose-500/10"
                : "border-emerald-500/20 bg-emerald-500/10"
            )}
          >
            <div
              className={clsx(
                "absolute inset-0 rounded-full",
                isWorkPhase
                  ? "animate-pulse-slow bg-rose-500/5"
                  : "animate-pulse-slow bg-emerald-500/5"
              )}
            />
            <div className="text-4xl font-bold z-10">
              {Countdown({ seconds: timeLeft })}
            </div>
          </motion.div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={clsx(
                "px-8 py-3 rounded-xl font-medium transition-colors",
                "shadow-lg shadow-blue-500/20",
                isActive
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-blue-500 hover:bg-blue-600"
              )}
            >
              {isActive ? "Pause" : "Start"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="px-8 py-3 rounded-xl font-medium bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              Reset
            </motion.button>
          </div>

          {/* Progress Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Work Duration</p>
              <p className="text-2xl font-bold">{WORK_TIME / 60} min</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Break Duration</p>
              <p className="text-2xl font-bold">{BREAK_TIME / 60} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
