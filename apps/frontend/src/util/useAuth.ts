import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

interface AuthPayload {
  email: string;
  password: string;
}

interface PomodoroPayload {
  workTime?: number;
  breakTime?: number;
}

// const API_URL = import.meta.env.VITE_BASE_API;
const API_URL = "http://localhost:3000/auth";

if (!API_URL) {
  console.error("VITE_BASE_API is not defined in .env");
}
// TODO More type safety
const api = async (url: string, data: any, method = "POST") => {
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && method === "GET"
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    body: method !== "GET" ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Network response was not ok: ${errorText}`);
  }

  return response.json();
};

export const useAuth = () => {
  const setToken = useAuthStore((state) => state.setToken);

  const loginMutation = useMutation({
    mutationFn: (data: AuthPayload) => api(`${API_URL}/login`, data),
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem("token", data.token);
    },
    onError: (error: Error) => {
      console.error("Login Error:", error);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: AuthPayload) => api(`${API_URL}/signup`, data),
    onSuccess: () => {
      console.log("Signup Successful");
    },
    onError: (error: Error) => {
      console.error("Signup Error:", error);
    },
  });

  const savePomodoroMutation = useMutation({
    mutationFn: (data: PomodoroPayload) => api(`${API_URL}/pomodoro`, data),
    onSuccess: () => {
      console.log("Pomodoro saved");
    },
    onError: (error: Error) => {
      console.error("Pomodoro Save Error", error);
    },
  });

  const pomodoroQuery = useQuery({
    queryKey: ["pomodoro"],
    queryFn: () => api(`${API_URL}/pomodoro`, {}, "GET"),
  });

  return { loginMutation, signupMutation, savePomodoroMutation, pomodoroQuery };
};
