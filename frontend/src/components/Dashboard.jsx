import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalReports: 0,
    avgHours: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const refreshHandler = () => loadDashboardData();
    window.addEventListener('work-data-changed', refreshHandler);
    return () => window.removeEventListener('work-data-changed', refreshHandler);
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiRequest('/admin/dashboard/stats');
      const dashboardData = response.data;
      const completedTasks = (dashboardData.statusDistribution || []).find((s) => s._id === 'Completed')?.count || 0;
      const pendingTasks = (dashboardData.statusDistribution || []).find((s) => s._id === 'Pending')?.count || 0;

      setStats({
        totalEmployees: dashboardData.totalEmployees || 0,
        totalReports: dashboardData.totalReports || 0,
        avgHours: Number(dashboardData.avgHoursPerDay || 0).toFixed(1),
        completedTasks,
        pendingTasks
      });
      setRecentReports(dashboardData.recentReports || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard data');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}! Here's your workspace overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-info">
            <h3>Total Employees</h3>
            <p className="stat-number">{stats.totalEmployees}</p>
            <span className="stat-trend">Active members</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="stat-info">
            <h3>Total Reports</h3>
            <p className="stat-number">{stats.totalReports}</p>
            <span className="stat-trend">Work updates</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <h3>Avg Hours/Day</h3>
            <p className="stat-number">{stats.avgHours} hrs</p>
            <span className="stat-trend">Per employee</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-info">
            <h3>Completed Tasks</h3>
            <p className="stat-number">{stats.completedTasks}</p>
            <span className="stat-trend">This month</span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Task Status</h3>
          <div className="pie-chart">
            <div className="pie-segments">
              <div className="segment completed">
                <div className="segment-color"></div>
                <div className="segment-info">
                  <span>Completed</span>
                  <strong>{stats.completedTasks}</strong>
                </div>
              </div>
              <div className="segment pending">
                <div className="segment-color"></div>
                <div className="segment-info">
                  <span>Pending</span>
                  <strong>{stats.pendingTasks}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-reports-section">
        <h3>Recent Work Reports</h3>
        <div className="reports-table-container">
          {recentReports.length === 0 ? (
            <div className="no-data">No recent reports available</div>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                 
                  <th>Date</th>
                  <th>Project</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr key={report._id || index}>
                   
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.project}</td>
                    <td>{report.hoursSpent} hrs</td>
                    <td>
                      <span className={`status-badge status-${report.status.toLowerCase().replace(' ', '-')}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;