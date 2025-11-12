import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Import your pages
import Home from "./pages/Home";
import Timetables from "./pages/Timetables";
import Rooms from "./pages/Rooms";
import Conflicts from "./pages/Conflicts";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";

export default function App() {
  return (
    // 🌄 Outer div: background image
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* 🌫️ Inner overlay: slightly translucent for readability */}
      <div className="flex flex-col min-h-screen bg-white/80 backdrop-blur-sm">
        {/* ✅ Header at the top */}
        <Header />

        {/* ✅ Main content area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timetables" element={<Timetables />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/conflicts" element={<Conflicts />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>

        {/* ✅ Footer at bottom */}
        <Footer />
      </div>
    </div>
  );
}
