import { Suspense } from "react";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Loading, please wait...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default Login;
