import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import VendorDetails from "./pages/VendorDetails";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import ServiceDetails from "./pages/ServiceDetails";
import VendorDashboard from "./pages/VendorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/services" element={<Services />} />

        <Route
          path="/services/:serviceId"
          element={<ServiceDetails />}
        />

        <Route
          path="/services/:serviceId/book"
          element={<Booking />}
        />

        <Route
          path="/vendor/:id"
          element={<VendorDetails />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
  path="/vendor-dashboard"
  element={<VendorDashboard />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;