import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 text-gray-900 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-12 text-center max-w-md animate-fade-in">
        <h1 className="text-8xl font-extrabold text-red-500 mb-6">404</h1>
        <p className="text-2xl font-semibold mb-4">
          Oops! <span className="text-blue-600">Chess</span> not found.
        </p>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been moved or does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-105"
        >
          Go Back Home
        </Link>
      </div>

      {/* Optional subtle background element */}
      <div className="absolute -z-10 w-96 h-96 bg-blue-200 opacity-20 rounded-full blur-3xl top-20 left-1/4 animate-pulse-slow"></div>
      <div className="absolute -z-10 w-96 h-96 bg-red-200 opacity-20 rounded-full blur-3xl bottom-20 right-1/4 animate-pulse-slow"></div>
    </div>
  );
}
