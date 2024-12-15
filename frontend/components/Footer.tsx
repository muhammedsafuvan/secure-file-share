export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-12">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          Secure File Sharing App © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
