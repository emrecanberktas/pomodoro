import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

interface AuthPayload {
  email: string;
  password: string;
}

// const API_URL = import.meta.env.VITE_BASE_API;
const API_URL = "http://localhost:3000";

if (!API_URL) {
  console.error("VITE_BASE_API is not defined in .env");
}

const api = async (url: string, data: AuthPayload) => {
  const formData = new FormData();
  formData.append("email", data.email);
  formData.append("password", data.password);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  console.log(`Fetching URL: ${url}`);

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
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: AuthPayload) => api(`${API_URL}/signup`, data),
    onSuccess: () => {
      console.log("Signup successful");
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });

  return { loginMutation, signupMutation };
};
