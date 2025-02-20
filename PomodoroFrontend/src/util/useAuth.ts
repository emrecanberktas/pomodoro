import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

const API_URL = "http://localhost:3000/auth";

export const useAuth = () => {
  const { setToken } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Giriş başarısız!");
      return res.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Kayıt başarısız!");
      return res.json();
    },
  });

  return { loginMutation, signupMutation };
};
