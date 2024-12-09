import ClientLayout from "@/components/ClientLayout"; // Import the client-side wrapper
import "./globals.css";

export const metadata = {
  title: "Secure File Sharing App",
  description: "A secure file-sharing application with encryption and MFA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
