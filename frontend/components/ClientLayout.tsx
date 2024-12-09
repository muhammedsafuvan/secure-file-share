"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </Provider>
  );
}
