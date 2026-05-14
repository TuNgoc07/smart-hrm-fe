import { BrowserRouter, Routes, Route } from "react-router-dom";
import HRAdminRoutes from "./routes/HRAdminRoutes";
import ManagerRoutes from "./routes/ManagerRoutes";
import { EmployeeRoutes } from "./routes/EmployeeRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import LoginScreen from "./auth/LoginScreen";

export default function App() {
  return (
    // <BrowserRouter>
    //   <AuthRoutes/>
    // </BrowserRouter>

    <BrowserRouter>
      <HRAdminRoutes />
      <ManagerRoutes />
      <EmployeeRoutes />
      <AuthRoutes/>

    </BrowserRouter>
  );
}
