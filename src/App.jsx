import { BrowserRouter, Routes, Route } from "react-router-dom";
import HRAdminRoutes from "./routes/HRAdminRoutes";
import ManagerRoutes from "./routes/ManagerRoutes";
import { EmployeeRoutes } from "./routes/EmployeeRoutes";

export default function App() {
  return (
    <BrowserRouter>
      {/* <HRAdminRoutes/> */}
      {/* <ManagerRoutes/> */}
      <EmployeeRoutes />
        
      
    </BrowserRouter>
  );
}
