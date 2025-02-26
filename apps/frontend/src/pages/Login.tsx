import { useState } from "react";
import { useAuth } from "../util/useAuth";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation } = useAuth();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
      }
    );
  };

  return (
    <div>
      {token ? (
        <p>Login Success!</p>
      ) : (
        <>
          <h1>Login</h1>
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
            {loginMutation.isPending ? "Logging In" : "Login"}
          </button>
          {loginMutation.isError && (
            <p style={{ color: "red" }}>
              Giriş başarısız: {loginMutation.error?.message}
            </p>
          )}
        </>
      )}
    </div>
  );
};
