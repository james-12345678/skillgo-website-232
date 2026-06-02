import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BecomeMentor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    // If not, redirect to sign-up
    if (user) {
      navigate("/forensic-app", { replace: true });
    } else {
      navigate("/signup", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full animate-spin bg-gradient-to-r from-logo-blue to-logo-gold p-0.5">
        <div className="w-full h-full bg-background rounded-full"></div>
      </div>
    </div>
  );
};

export default BecomeMentor;
