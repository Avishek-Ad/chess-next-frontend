import { Suspense } from "react";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default Login;
