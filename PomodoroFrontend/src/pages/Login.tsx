import { useState } from "react";
import { useAuth } from "../util/useAuth";
import { useAuthStore } from "../store/authStore";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation } = useAuth();
  const { token } = useAuthStore();

  const handleLogin = async () => {
    loginMutation.mutate({ email, password });
  };

  return (
    <div>
      {token ? (
        <p>Giriş Yapıldı!</p>
      ) : (
        <>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
          />
          <button onClick={handleLogin} disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </>
      )}
    </div>
  );
};
