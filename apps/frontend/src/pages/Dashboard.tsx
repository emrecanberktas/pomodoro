import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuthStore } from "../store/authStore";
import clsx from "clsx";
import Countdown from "@/components/Countdown";
import { useAuth } from "@/util/useAuth";
import { Settings, X } from "lucide-react";

// Add constants for localStorage keys
const STORAGE_KEYS = {
  WORK_TIME: "pomodoro_work_time",
  BREAK_TIME: "pomodoro_break_time",
} as const;

const WORK_TIME = 0.5 * 60; // 25 dakika (saniye cinsinden)
const BREAK_TIME = 5 * 60; // 5 dakika (saniye cinsinden)

export default function Dashboard() {
  const { clearToken } = useAuthStore();
  const { savePomodoroMutation, pomodoroQuery } = useAuth();

  // Get initial values from localStorage or fall back to query data or defaults
  const getInitialWorkTime = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.WORK_TIME);
    if (stored) return parseInt(stored);
    return pomodoroQuery.data?.workTime || 25 * 60;
  };

  const getInitialBreakTime = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.BREAK_TIME);
    if (stored) return parseInt(stored);
    return pomodoroQuery.data?.breakTime || 5 * 60;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialWorkTime());
  const [isActive, setIsActive] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    workTime: getInitialWorkTime() / 60,
    breakTime: getInitialBreakTime() / 60,
  });

  // Use localStorage values or fallback to query data
  const WORK_TIME = getInitialWorkTime();
  const BREAK_TIME = getInitialBreakTime();

  useEffect(() => {
    if (pomodoroQuery.data) {
      if (isWorkPhase) {
        setTimeLeft(pomodoroQuery.data.workTime);
      } else {
        setTimeLeft(pomodoroQuery.data.breakTime);
      }
    }
  }, [pomodoroQuery.data, isWorkPhase]);

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

  // Update localStorage when settings change
  const handleSaveSettings = () => {
    setIsActive(false);

    const newWorkTime = tempSettings.workTime * 60;
    const newBreakTime = tempSettings.breakTime * 60;

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.WORK_TIME, newWorkTime.toString());
    localStorage.setItem(STORAGE_KEYS.BREAK_TIME, newBreakTime.toString());

    savePomodoroMutation.mutate(
      {
        workTime: newWorkTime,
        breakTime: newBreakTime,
      },
      {
        onSuccess: () => {
          setTimeLeft(isWorkPhase ? newWorkTime : newBreakTime);
          setShowSettings(false);
        },
      }
    );
  };

  // Update timeLeft when phase changes
  useEffect(() => {
    const currentTime = isWorkPhase ? WORK_TIME : BREAK_TIME;
    setTimeLeft(currentTime);
  }, [isWorkPhase, WORK_TIME, BREAK_TIME]);

  // Clear localStorage on logout
  const handleLogout = () => {
    clearToken();
    localStorage.removeItem(STORAGE_KEYS.WORK_TIME);
    localStorage.removeItem(STORAGE_KEYS.BREAK_TIME);
    localStorage.removeItem("token");
  };

  // Calculate progress percentage (reversed for countdown effect)
  const getProgress = () => {
    const total = isWorkPhase ? WORK_TIME : BREAK_TIME;
    // Return remaining percentage instead of completed percentage
    return (timeLeft / total) * 100;
  };

  // Calculate circumference for SVG circle
  const circleSize = 240;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute right-0 text-gray-400 transition-colors -top-12 hover:text-white"
        >
          <Settings size={20} />
        </button>

        {/* Main Timer Card */}
        <div className="bg-[#242424] rounded-3xl p-8 shadow-xl">
          {/* Phase Indicator */}
          <div className="flex justify-center mb-8">
            <div
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium",
                isWorkPhase
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-green-500/10 text-green-400"
              )}
            >
              {isWorkPhase ? "Focus Time" : "Break Time"}
            </div>
          </div>

          {/* Timer Circle with Progress */}
          <div className="relative w-60 h-60 mx-auto mb-8">
            {/* Background Circle */}
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox={`0 0 ${circleSize} ${circleSize}`}
            >
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                className="fill-none stroke-[#333]"
              />
              <motion.circle
                key={timeLeft}
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                strokeWidth={strokeWidth}
                className={clsx(
                  "fill-none",
                  isWorkPhase ? "stroke-blue-500" : "stroke-green-500"
                )}
                style={{
                  strokeDasharray: circumference,
                  // Reverse the offset calculation for countdown effect
                  strokeDashoffset: circumference * (1 - getProgress() / 100),
                }}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: circumference * (1 - getProgress() / 100),
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </svg>

            {/* Timer Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-light text-white mb-1">
                  {Countdown({ seconds: timeLeft })}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleTimer}
              className={clsx(
                "px-8 py-3 rounded-xl font-medium w-32 transition-colors",
                isActive
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              {isActive ? "Stop" : "Start"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetTimer}
              className="w-32 px-8 py-3 rounded-xl font-medium bg-[#333] text-gray-300 hover:bg-[#383838] transition-colors"
            >
              Reset
            </motion.button>
          </div>

          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-[#2a2a2a] rounded-xl p-4">
              <div className="text-gray-400 text-xs mb-1">Work Time</div>
              <div className="text-white text-lg font-medium">
                {WORK_TIME / 60}:00
              </div>
            </div>
            <div className="bg-[#2a2a2a] rounded-xl p-4">
              <div className="text-gray-400 text-xs mb-1">Break Time</div>
              <div className="text-white text-lg font-medium">
                {BREAK_TIME / 60}:00
              </div>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#242424] rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Work Time Setting */}
                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.workTime}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        workTime: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#333] border border-[#444] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Break Time Setting */}
                <div>
                  <label className="block mb-2 text-sm text-gray-400">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.breakTime}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        breakTime: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#333] border border-[#444] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-gray-400 transition-colors rounded-lg hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="text-gray-400 text-sm hover:text-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
