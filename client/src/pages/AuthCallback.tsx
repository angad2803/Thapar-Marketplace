import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token in localStorage
      localStorage.setItem("token", token);
      
      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      // No token, redirect to login with error
      navigate("/login?error=authentication_failed");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Logging you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
