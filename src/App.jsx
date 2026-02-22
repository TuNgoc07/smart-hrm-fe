import { BrowserRouter, Routes, Route } from "react-router-dom";
import HRAdminRoutes from "./routes/HRAdminRoutes";
import ManagerRoutes from "./routes/ManagerRoutes";

export default function App() {
  return (
    <BrowserRouter>
      {/* <HRAdminRoutes/> */}
      <ManagerRoutes/>
        
      
    </BrowserRouter>
  );
}
