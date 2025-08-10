import { SignIn, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

const Login = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard");
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold">Curating your Profile Sir...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
};

export default Login;
