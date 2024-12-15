import Link from "next/link";
import '../styles/globals.css';

export default function Home() {
  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center py-12 px-6">
      {/* Welcome Text */}
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-7xl dark:text-white text-center mb-8">
  Welcome
  <br />
  <span className="text-xl text-gray-600 dark:text-gray-400 block mb-4">to</span>
  Secure File Sharing
  <br />
  <span className="text-xl text-gray-600 dark:text-gray-400 block mt-4">
    Share Files with Confidence and Security
  </span>
</h1>

      <div className="w-full flex flex-col items-center space-y-4">
  <Link
    href="/register"
    className="w-full max-w-xs text-center py-2 px-4 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800"
  >
    Register
  </Link>
  <Link
    href="/login"
    className="w-full max-w-xs text-center py-2 px-4 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800"
  >
    Login
  </Link>
</div>
    </main>
  );
}
