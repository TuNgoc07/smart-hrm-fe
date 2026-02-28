import { Route, Routes } from "react-router-dom";
import ManagerLayout from "../layouts/ManagerLayout";
import ManagerHomeScreen from "../pages/manager/ManagerHomeScreen"
import TeamOverviewScreen from "../pages/manager/hrm/team/TeamOverviewScreen";
import TeamAttendanceScreen from "../pages/manager/hrm/team/TeamAttendanceScreen";
import RequestsScreen from "../pages/manager/hrm/request/RequestsScreen";
import RequestDetailScreen from "../pages/manager/hrm/request/RequestDetail";
import ApprovalHistoryScreen from "../pages/manager/hrm/request/ApprovalHistoryScreen";
import AIInsightScreen from "../pages/manager/hrm/intelligence/insights/AIInsightScreen";
import NotificationScreen from "../pages/manager/hrm/notification/NotificationScreen";
import TeamCalendarScreen from "../pages/manager/hrm/team/TeamCalendarScreen";
import ManagerSettingScreen from "../pages/manager/hrm/setting/ManagerSettingScreen";
import TeamMembersScreen from "../pages/manager/hrm/team/TeamMembersScreen";
import { MemberProfileScreen } from "../pages/manager/hrm/team/MemberProfileScreen";

export default function ManagerRoutes() {
    return (
        <Routes>
            <Route element={<ManagerLayout />}>
                <Route path="/manager/home" element={<ManagerHomeScreen />} />
                <Route path="/manager/team" element={<TeamOverviewScreen />} />
                <Route path="/manager/team-attendance" element={<TeamAttendanceScreen />} />
                <Route path="/manager/requests" element={<RequestsScreen />} />
                <Route path="/manager/request-details" element={<RequestDetailScreen />} />
                <Route path="/manager/approval-history" element={<ApprovalHistoryScreen />} />
                <Route path="/manager/insights" element={<AIInsightScreen />} />
                <Route path="/manager/notifications" element={<NotificationScreen />} />
                <Route path="/manager/team-calendar" element={<TeamCalendarScreen />} />
                <Route path="/manager/settings" element={<ManagerSettingScreen />} />
                <Route path="/manager/team-members" element={<TeamMembersScreen />} />
                <Route path="/manager/profile" element={<MemberProfileScreen />} />

            </Route>
        </Routes>
    );
}