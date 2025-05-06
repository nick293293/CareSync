import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StaffLogin from "./frames/StaffLogin";
import StaffPage from "./frames/StaffPage";
import AdminLogin from "./frames/AdminLogin";
import AdminPage from "./frames/AdminPage";
import Help from "./frames/Help";
import FAQ from "./frames/FAQ";
import ForgotPage from "./frames/ForgotPage";
import ResetPasswordPage from "./frames/ResetPass";
import AddUser from "./frames/AddUser";
import RemoveUser from "./frames/RemoveUser";
import EditUser from "./frames/EditUser";
import EditUserList from "./frames/EditUserList";
import ManageAppointments from "./components/ManageAppointments";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./frames/Unauthorized";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StaffLogin />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/forgotpassword" element={<ForgotPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminPage"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-user"
          element={
            <ProtectedRoute>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/remove-user"
          element={
            <ProtectedRoute>
              <RemoveUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-user-list"
          element={
            <ProtectedRoute>
              <EditUserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-user/:id"
          element={
            <ProtectedRoute>
              <EditUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-appointments"
          element={
            <ProtectedRoute>
              <ManageAppointments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
