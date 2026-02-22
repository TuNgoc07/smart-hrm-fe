import { Routes , Route} from "react-router-dom";
import HRAdminLayout from "../layouts/HRAdminLayout";
import HRHomeScreen from "../pages/hradmin/HRHomeScreen";
import HRDashboard from "../pages/hradmin/hrm/dashboard/HRDashboard";
import AttendanceScreen from "../pages/hradmin/hrm/attendance/AttendanceScreen";
import EmployeeListScreen from "../pages/hradmin/hrm/employeeManagement/EmployeeListScreen";
import EmployeeDetailScreen from "../pages/hradmin/hrm/employeeManagement/EmployeeDetailScreen";
import DepartmentListScreen from "../pages/hradmin/hrm/department/DepartmentListScreen";
import PositionListScreen from "../pages/hradmin/hrm/position/positionListScreen";
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
import PayrollConfigurationScreen from "../pages/hradmin/hrm/payhub/PayrollConfigurationScreen";
import AIInsightsDashboard from "../pages/hradmin/hrm/intelligence/insights/AIInsightScreen";
import SupportHubScreen from "../pages/hradmin/hrm/intelligence/assistance/SupportHubScreen";
import AutomationRulesScreen from "../pages/hradmin/hrm/intelligence/automation/AutomationRuleScreen";

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
                <Route path="/hr/contract-list" element={<ContractListScreen />} />
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
                <Route path="/hr/payroll-config" element={<PayrollConfigurationScreen />} />
                <Route path="/hr/ai-insights" element={<AIInsightsDashboard />} />
                <Route path="/hr/ai-assistant" element={<SupportHubScreen />} />
                <Route path="/hr/automation-rules" element={<AutomationRulesScreen />} />
            </Route>
        </Routes>
    );
}