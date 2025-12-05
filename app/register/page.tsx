"use client";

import { FormEvent, useState } from "react";
import apiService from "../services/apiService";
import { useRouter } from "next/navigation";
import useShowMessage from "../hooks/useShowMessage";
import Link from "next/link";

const Signup = () => {
  const router = useRouter();
  const { setMessage } = useShowMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState();

  const submitSignup = async (e: FormEvent) => {
    e.preventDefault();

    const formData = {
      email: email,
      password: password,
      confirm_password: passwordConfirm,
    };

    const response = await apiService.post(
      "/api/auth/register/",
      JSON.stringify(formData)
    );
    // console.log(response);
    if (response.id) {
      setMessage(false, "Registration Successful, Now Login.");
      router.push("/login");
    } else if (response.message) {
      setError(response.message)
    } else {
      setError(response.detail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Signup
        </h2>
        <form className="space-y-4" onSubmit={(e) => submitSignup(e)}>
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

          <input
            required
            onChange={(e) => setPasswordConfirm(e.target.value)}
            type="password"
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-airbnb transition"
            placeholder="confirm password"
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
            Login
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4 text-center">
          {`Don't`} have an account?{" "}
          <Link href="/login" className="text-airbnb font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
