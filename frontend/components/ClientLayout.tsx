"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <main>{children}</main>
      <Footer />
    </Provider>
  );
}
