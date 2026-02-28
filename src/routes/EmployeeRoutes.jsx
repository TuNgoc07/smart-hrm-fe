import { Route, Routes } from "react-router-dom";
import EmployeeHomeScreen from "../pages/employee/EmployeeHomeScreen";
import EmployeeLayout from "../layouts/EmployeeLayout";
import ProfileScreen from "../pages/employee/hrm/individual/ProfileScreen";
import MyDocumentScreen from "../pages/employee/hrm/materials/MyDocumentScreen";
import MyAttendanceScreen from "../pages/employee/hrm/attendance/MyAttendanceScreen";
import MyRequestScreen from "../pages/employee/hrm/materials/MyRequestScreen";
import NewRequestScreen from "../pages/employee/hrm/materials/NewRequestScreen";
import RequestDetailScreen from "../pages/employee/hrm/materials/RequestDetailScreen";
import MyPayslipScreen from "../pages/employee/hrm/materials/MyPayslipScreen";
import NotificationScreen from "../pages/employee/hrm/notification/NotificationScreen";
import ChatbotScreen from "../pages/employee/hrm/intelligence/ChatbotScreen";

export function EmployeeRoutes() {
    return (
        <Routes>
            <Route element={<EmployeeLayout />}>
                <Route path="/employee/home" element={<EmployeeHomeScreen />} />
                <Route path="/employee/profile" element={<ProfileScreen />} />
                <Route path="/employee/my-documents" element={<MyDocumentScreen />} />
                <Route path="/employee/my-attendance" element={<MyAttendanceScreen />} />
                <Route path="/employee/my-requests" element={<MyRequestScreen />} />
                <Route path="/employee/new-request" element={<NewRequestScreen />} />
                <Route path="/employee/request-details" element={<RequestDetailScreen />} />
                <Route path="/employee/my-payslip" element={<MyPayslipScreen />} />
                <Route path="/employee/notifications" element={<NotificationScreen />} />
                <Route path="/employee/chatbot" element={<ChatbotScreen />} />
            </Route>
        </Routes>
    )
}