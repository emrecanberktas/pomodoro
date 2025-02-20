import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

interface AuthPayload {
  email: string;
  password: string;
}

const api = async (url: string, data: AuthPayload) => {
  const formData = new FormData();
  formData.append("email", data.email);
  formData.append("password", data.password);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
};

export const useAuth = () => {
  const setToken = useAuthStore((state) => state.setToken);

  const loginMutation = useMutation({
    mutationFn: (data: AuthPayload) => api("/api/auth/login", data),
    onSuccess: (data) => {
      setToken(data.token); // Token'ı store'a kaydet
      localStorage.setItem("token", data.token); // Token'ı localStorage'a kaydet
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: AuthPayload) => api("/api/auth/signup", data),
    onSuccess: () => {
      // Signup başarılıysa login sayfasına yönlendirebiliriz
      console.log("Signup successful");
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });

  return { loginMutation, signupMutation };
};
