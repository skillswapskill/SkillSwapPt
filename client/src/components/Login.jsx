import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
const Login = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {!isLoaded ? (
        <p className="text-lg font-semibold">Curating your Profile Sir</p>
      ) : isSignedIn ? (
        <p className="text-lg font-semibold text-green-600">You are already signed in</p>
      ) : (
        <SignIn afterSignInUrl="/profile" />
        
        
      )}
    </div>
  );
};

export default Login;
