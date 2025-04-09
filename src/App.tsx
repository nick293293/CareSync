import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import StaffLogin from "./frames/StaffLogin";
import StaffPage from "./frames/StaffPage";
import AdminLogin from "./frames/AdminLogin";
import AdminPage from "./frames/AdminPage";
import Help from "./frames/Help";
import FAQ from "./frames/FAQ";
import ForgotPage from "./frames/ForgotPage";
import ResetPasswordPage from "./frames/ResetPass";
import AddUser from "./frames/AddUser";
import ManageAppointments from "./components/ManageAppointments";
import { useDisclosure } from "@chakra-ui/react";

const StaffPageWrapper = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return <StaffPage isOpen={isOpen} onOpen={onOpen} onClose={onClose} />;
};

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StaffLogin />} />
          <Route path="/staff" element={<StaffPageWrapper />} />
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route path="/adminPage" element={<AdminPage />} />
          <Route path="/help" element={<Help />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/forgotpassword" element={<ForgotPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/manage-appointments" element={<ManageAppointments />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
