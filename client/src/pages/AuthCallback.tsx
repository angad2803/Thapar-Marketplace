import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EncryptionSetup from "@/components/EncryptionSetup";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showEncryptionSetup, setShowEncryptionSetup] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token in localStorage
      localStorage.setItem("token", token);

      // Optionally fetch user info and store role
      fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            localStorage.setItem("userRole", data.data.role);
            localStorage.setItem("userId", data.data._id);
          }
        });

      // Show encryption setup before redirecting
      setShowEncryptionSetup(true);
    } else {
      // No token, redirect to login with error
      navigate("/login?error=authentication_failed");
    }
  }, [searchParams, navigate]);

  const handleEncryptionComplete = () => {
    navigate("/dashboard");
  };

  if (showEncryptionSetup) {
    return <EncryptionSetup onComplete={handleEncryptionComplete} />;
  }

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
