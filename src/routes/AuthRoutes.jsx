import { Route, Routes } from "react-router-dom";
import LoginScreen from "../auth/LoginScreen";
import ForgotPasswordScreen from "../auth/ForgotPasswordScreen";
import ChangePasswordScreen from "../auth/ChangePasswordScreen";

export default function AuthRoutes(){
    return(
        <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/change-password" element={<ChangePasswordScreen />} />
        </Routes>
    );
}