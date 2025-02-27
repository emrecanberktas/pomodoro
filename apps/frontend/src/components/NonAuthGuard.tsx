import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const NonAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return <>{children}</>;
};
