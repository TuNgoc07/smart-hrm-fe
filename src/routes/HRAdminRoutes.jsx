import { Routes , Route} from "react-router-dom";
import HRAdminLayout from "../layouts/HRAdminLayout";
import HRHomeScreen from "../pages/hradmin/HRHomeScreen";
import HRDashboard from "../pages/hradmin/hrm/dashboard/HRDashboard";
import AttendanceScreen from "../pages/hradmin/hrm/attendance/AttendanceScreen";
import EmployeeListScreen from "../pages/hradmin/hrm/employeeManagement/EmployeeListScreen";
import EmployeeDetailScreen from "../pages/hradmin/hrm/employeeManagement/EmployeeDetailScreen";
import DepartmentListScreen from "../pages/hradmin/hrm/department/DepartmentListScreen";
import PositionListScreen from "../pages/hradmin/hrm/position/PositionListScreen";
import JobListScreen from "../pages/hradmin/hrm/position/JobListScreen";
import ContractListScreen from "../pages/hradmin/hrm/contract/ContractListScreen";
import OrgChartScreen from "../pages/hradmin/hrm/department/OrgChartScreen";
import AttendanceRecordScreen from "../pages/hradmin/hrm/attendance/AttendanceRecordScreen";
import AttendanceExceptionsScreen from "../pages/hradmin/hrm/attendance/AttendanceExceptionScreen";
import WorkflowStatisticScreen from "../pages/hradmin/hrm/workflow/WorkflowStatisticScreen";
import WorkflowConfigScreen from "../pages/hradmin/hrm/workflow/WorkflowConfigurationScreen";
import HRRequestsScreen from "../pages/hradmin/hrm/workflow/HRRequestsScreen";
import HRRequestDetailScreen from "../pages/hradmin/hrm/workflow/RequestDetailScreen";
import PayrollOverviewScreen from "../pages/hradmin/hrm/payhub/PayrollOverviewScreen";
import PayrollCalculationScreen from "../pages/hradmin/hrm/payhub/PayrollCalculationScreen";
import PayrollResultScreen from "../pages/hradmin/hrm/payhub/PayrollResultScreen";
import PayslipHistoryScreen from "../pages/hradmin/hrm/payhub/PayslipHistoryScreen";
import PayrollConfigurationScreen from "../pages/hradmin/hrm/payhub/PayrollConfigurationScreen";
import AttendancePeriodConfigScreen from "../pages/hradmin/hrm/payhub/AttendancePeriodConfigScreen";
import HolidayCalendarScreen from "../pages/hradmin/hrm/payhub/HolidayCalendarScreen";
import AIInsightsDashboard from "../pages/hradmin/hrm/intelligence/insights/AIInsightScreen";
import AutomationRulesScreen from "../pages/hradmin/hrm/intelligence/automation/AutomationRuleScreen";
import AIChatScreen from "../pages/shared/AIChatScreen";
import ContractTemplateListScreen from "../pages/hradmin/hrm/contract/ContractTemplateListScreen";
import TeamListScreen from "../pages/hradmin/hrm/department/TeamListScreen";
import LeavePolicyManagementScreen from "../pages/hradmin/hrm/employeeManagement/LeavePolicyManagementScreen";
import ChecklistTemplateManagementScreen from "../pages/hradmin/hrm/checklist/ChecklistTemplateManagementScreen";
import ChecklistAssignmentScreen from "../pages/hradmin/hrm/checklist/ChecklistAssignmentScreen";
import NotificationScreen from "../pages/hradmin/hrm/notification/NotificationScreen";

export default function HRAdminRoutes(){
    return (
        <Routes>
            <Route element={<HRAdminLayout />}>
                <Route path="/hr/home" element={<HRHomeScreen />} />
                <Route path="/hr/dashboard" element={<HRDashboard />} />
                <Route path="/hr/attendance" element={<AttendanceScreen />}/>
                <Route path="/hr/employee-list" element={<EmployeeListScreen />}/>
                <Route path="/hr/employee-detail/:emp_id" element={< EmployeeDetailScreen />} />
                <Route path="/hr/department-list" element={<DepartmentListScreen />} />
                <Route path="/hr/position-list" element={<PositionListScreen />} />
                <Route path="/hr/jobs" element={<JobListScreen />} />
                <Route path="/hr/teams" element={<TeamListScreen />} />
                <Route path="/hr/leave-policies" element={<LeavePolicyManagementScreen />} />
                <Route path="/hr/checklist-templates" element={<ChecklistTemplateManagementScreen />} />
                <Route path="/hr/checklist-assignments" element={<ChecklistAssignmentScreen />} />
                <Route path="/hr/notifications" element={<NotificationScreen />} />
                <Route path="/hr/contract-list" element={<ContractListScreen />} />
                <Route path="/hr/contract-templates" element={<ContractTemplateListScreen />} />
                <Route path="/hr/org-chart" element={<OrgChartScreen/>} />
                <Route path="/hr/attendance/records" element={<AttendanceRecordScreen />} />
                <Route path="/hr/attendance/exceptions" element={<AttendanceExceptionsScreen />} />
                <Route path="/hr/workflow-statistic" element={<WorkflowStatisticScreen />} />
                <Route path="/hr/workflow-statistic" element={<WorkflowStatisticScreen />} />
                <Route path="/hr/workflow-configuration" element={<WorkflowConfigScreen />} />
                <Route path="/hr/requests" element={<HRRequestsScreen />} />
                <Route path="/hr/request-details/:request_id" element={<HRRequestDetailScreen />} />
                <Route path="/hr/payroll-overview" element={<PayrollOverviewScreen />} />
                <Route path="/hr/payroll-calculation" element={<PayrollCalculationScreen />} />
                <Route path="/hr/payroll-results" element={<PayrollResultScreen />} />
                <Route path="/hr/payslip-history" element={<PayslipHistoryScreen />} />
                <Route path="/hr/payroll-config" element={<PayrollConfigurationScreen />} />
                {/* Cấu hình kỳ chấm công — HR Admin config ngày bắt đầu kỳ 1 lần duy nhất */}
                <Route path="/hr/attendance-period-config" element={<AttendancePeriodConfigScreen />} />
                <Route path="/hr/holiday-calendar" element={<HolidayCalendarScreen />} />
                <Route path="/hr/ai-insights" element={<AIInsightsDashboard />} />
                <Route path="/hr/ai-assistant" element={<AIChatScreen />} />
                <Route path="/hr/automation-rules" element={<AutomationRulesScreen />} />
            </Route>
        </Routes>
    );
}