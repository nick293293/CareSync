//import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StaffLogin from "./frames/StaffLogin";
import StaffPage from "./frames/StaffPage";
import AdminLogin from "./frames/AdminLogin";
import AdminPage from "./frames/AdminPage";
import Help from "./frames/Help";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for the Login Page comment here 2 */}
        {/* Route for the Login Page comment here 2 */}
        <Route path="/" element={<StaffLogin />} />

        {/* Route for the Staff Page */}
        <Route path="/staff" element={<StaffPage />} />

        {/* Route for the AdminLogin Page */}
        <Route path="/adminLogin" element={<AdminLogin />} />

        {/* Route for the AdminPage Page ff */}
        <Route path="/adminPage" element={<AdminPage />} />

        <Route path="/help" element={<Help />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
