import { useState } from "react";
import { useAuth } from "../util/useAuth";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signupMutation } = useAuth();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const handleSignUp = () => {
    signupMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate("/login");
        },
      }
    );
  };

  return (
    <div>
      {token ? (
        <p>You Are Already Logged In</p>
      ) : (
        <>
          <h1>Sign Up</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignUp} disabled={signupMutation.isPending}>
            {signupMutation.isPending ? "Signing Up..." : "Sign Up"}
          </button>
          {signupMutation.isError && (
            <p style={{ color: "red" }}>
              Sign Up Failed: {signupMutation.error?.message}
            </p>
          )}
          {signupMutation.isSuccess && (
            <p style={{ color: "green" }}>Sign Up Successful!</p>
          )}
        </>
      )}
    </div>
  );
}

export default SignUp;
