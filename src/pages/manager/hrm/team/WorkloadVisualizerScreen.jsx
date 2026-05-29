import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function WorkloadVisualizerScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  useEffect(() => {
    // Set default period to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setPeriodEnd(formatDate(today));
    setPeriodStart(formatDate(thirtyDaysAgo));
  }, []);

  useEffect(() => {
    if (periodStart && periodEnd) {
      fetchWorkloadData();
    }
  }, [periodStart, periodEnd]);

  const fetchWorkloadData = async () => {
    try {
      if (!localStorage.getItem('token')) {
        return;
      }
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/manager/workload-distribution?periodStart=${periodStart}&periodEnd=${periodEnd}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch workload data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getWorkloadLevelColor = (level) => {
    switch (level) {
      case 'HEALTHY':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'OVERLOADED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'NEEDS_ATTENTION':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTeamHealthStatusColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-emerald-600 bg-emerald-50';
      case 'AT_RISK':
        return 'text-amber-600 bg-amber-50';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      case 'ATTENTION_NEEDED':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <WorkloadSkeleton />;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load workload data</div>;
  }

  const { teamAverageWorkload, totalMembers, healthyCount, moderateCount, overloadedCount, needsAttentionCount, employeeWorkloads, teamHealthStatus } = data;

  return (
    <div className="space-y-6 mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workload Distribution</h1>
          <p className="text-sm text-slate-500 mt-1">Analyze team workload across multiple metrics</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">From:</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">To:</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Team Health Status Banner */}
      <div className={`flex items-center justify-between p-4 rounded-lg border ${getTeamHealthStatusColor(teamHealthStatus)}`}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl">
            {teamHealthStatus === 'HEALTHY' ? 'check_circle' : 
             teamHealthStatus === 'CRITICAL' ? 'warning' : 
             teamHealthStatus === 'ATTENTION_NEEDED' ? 'error' : 'info'}
          </span>
          <div>
            <p className="text-sm font-bold">Team Health: {teamHealthStatus.replace('_', ' ')}</p>
            <p className="text-xs opacity-75">Average workload score: {teamAverageWorkload}/100</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{totalMembers}</p>
          <p className="text-xs opacity-75">Team Members</p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Healthy"
          count={healthyCount}
          total={totalMembers}
          color="emerald"
          icon="check_circle"
        />
        <StatCard
          label="Moderate"
          count={moderateCount}
          total={totalMembers}
          color="amber"
          icon="trending_up"
        />
        <StatCard
          label="Overloaded"
          count={overloadedCount}
          total={totalMembers}
          color="red"
          icon="warning"
        />
        <StatCard
          label="Needs Attention"
          count={needsAttentionCount}
          total={totalMembers}
          color="purple"
          icon="error"
        />
      </div>

      {/* Employee Workload List */}
      <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#e7edf3] dark:border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Individual Workload Metrics
          </h2>
        </div>
        
        {employeeWorkloads && employeeWorkloads.length > 0 ? (
          <div className="divide-y divide-[#e7edf3] dark:divide-slate-800">
            {employeeWorkloads.map((employee) => (
              <EmployeeWorkloadRow
                key={employee.employeeId}
                employee={employee}
                getWorkloadLevelColor={getWorkloadLevelColor}
                getInitials={getInitials}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No workload data available for this period
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Workload Score Calculation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-medium">OT Hours (30%):</span>
            <span>20h OT = 100 score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Pending Requests (20%):</span>
            <span>10 pending = 100 score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Leave Utilization (20%):</span>
            <span>100% utilization = 100 score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Work Duration (20%):</span>
            <span>40h/week = 100 score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Late Frequency (10%):</span>
            <span>20 late = 100 score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Score Ranges:</span>
            <span>0-40 Healthy, 40-70 Moderate, 70+ Overloaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, count, total, color, icon }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-xl p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs opacity-75">{percentage}% of team</p>
    </div>
  );
}

function EmployeeWorkloadRow({ employee, getWorkloadLevelColor, getInitials, navigate }) {
  const handleClick = () => {
    navigate(`/manager/profile/${employee.employeeId}`);
  };

  return (
    <div
      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {employee.avatarUrl ? (
          <div
            className="size-12 rounded-full bg-slate-200 bg-cover flex-shrink-0"
            style={{ backgroundImage: `url(${employee.avatarUrl})` }}
          />
        ) : (
          <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {getInitials(employee.fullName)}
          </div>
        )}

        {/* Employee Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {employee.fullName}
            </p>
            <span className="text-xs text-slate-500">{employee.empCode}</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            {employee.positionName} • {employee.departmentName}
          </p>

          {/* Workload Level Badge */}
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getWorkloadLevelColor(employee.workloadLevel)}`}>
            {employee.workloadLevel.replace('_', ' ')}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-shrink-0">
          <MetricItem label="OT Hours" value={`${employee.otHours}h`} />
          <MetricItem label="Pending" value={employee.pendingRequests} />
          <MetricItem label="Leave %" value={`${employee.leaveUtilizationRate}%`} />
          <MetricItem label="Work Hours" value={`${employee.workDurationHours}h`} />
          <MetricItem label="Late Count" value={employee.lateFrequency} />
          <MetricItem label="Score" value={`${employee.workloadScore}/100`} highlight />
        </div>
      </div>

      {/* Recommendation */}
      {employee.recommendation && (
        <div className="mt-3 pt-3 border-t border-[#e7edf3] dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Recommendation:</span> {employee.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

function MetricItem({ label, value, highlight }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className={`font-medium ${highlight ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function WorkloadSkeleton() {
  return (
    <div className="space-y-6 mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Team Health Banner Skeleton */}
      <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Employee List Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#e7edf3] dark:border-slate-800">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-[#e7edf3] dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j}>
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend Skeleton */}
      <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
    </div>
  );
}
