import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

const Login = () => {
  const { isSignedIn, isLoaded } = useUser();

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
