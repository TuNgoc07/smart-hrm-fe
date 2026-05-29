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
import ChecklistDetailScreen from "../pages/employee/hrm/materials/ChecklistDetailScreen";
import NotificationScreen from "../pages/employee/hrm/notification/NotificationScreen";
import FaceRegistrationScreen from "../common/FaceRegistrationScreen";
import AIChatScreen from "../pages/shared/AIChatScreen";

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
                <Route path="/employee/request-details/:requestId" element={<RequestDetailScreen />} />
                <Route path="/employee/my-payslip" element={<MyPayslipScreen />} />
                <Route path="/employee/my-checklists/:assignmentId" element={<ChecklistDetailScreen />} />
                <Route path="/employee/notifications" element={<NotificationScreen />} />
                <Route path="/employee/ai-assistant" element={<AIChatScreen />} />
                <Route path="/face-registration" element={<FaceRegistrationScreen />} />

            </Route>
        </Routes>
    )
}