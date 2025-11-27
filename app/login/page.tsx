"use client";

import { FormEvent, useState } from "react";
import apiService from "../services/apiService";
import { useRouter, useSearchParams } from "next/navigation";
import { handleLogin } from "../lib/actions";
import useShowMessage from "../hooks/useShowMessage";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useShowMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();

    const formData = {
      email: email,
      password: password,
    };

    const response = await apiService.post(
      "/api/token/pair/",
      JSON.stringify(formData)
    );
    if (response.access) {
      await handleLogin(response.id, response.access, response.refresh);
      setMessage(false, "Login Successful");
      const nexturl = searchParams.get("next") ? searchParams.get("next") : "/";
      router.push(nexturl);
    } else {
      setError(response.detail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Login
        </h2>
        <form className="space-y-4" onSubmit={(e) => submitLogin(e)}>
          <input
            required
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-airbnb transition"
            placeholder="Your email address"
          />

          <input
            required
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-airbnb transition"
            placeholder="Your password"
          />

          {error && (
            <div className="p-3 bg-red-500 text-white rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-400 transition-all duration-200 shadow-sm"
          >
            Signup
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4 text-center">
          {`Don't`} have an account?{" "}
          <a
            href="/register"
            className="text-airbnb font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
