// src/components/HomePageLayout.tsx
// Bố cục trang chính cho các trang của chủ nhà
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function HomepageLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}