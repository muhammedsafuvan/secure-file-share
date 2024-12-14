import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Secure File Sharing</h1>
      <nav>
      <ul>
        <li>
          <Link href="/register">Register</Link>
        </li>
        <li>
          <Link href="/login">Login</Link>
        </li>
        
        
      </ul>
    </nav>
    </main>
  );
}
