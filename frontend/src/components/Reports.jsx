import React, { useState, useEffect } from 'react';
import { apiRequest, downloadFile } from '../services/api';
import { toast } from 'react-toastify';

const Reports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    employee: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0
  });

  useEffect(() => {
    loadReports();
    const refreshHandler = () => loadReports();
    window.addEventListener('work-data-changed', refreshHandler);
    return () => window.removeEventListener('work-data-changed', refreshHandler);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, reports]);

  const loadReports = async () => {
    try {
      const [reportsRes, usersRes] = await Promise.all([
        apiRequest('/admin/reports'),
        apiRequest('/admin/users')
      ]);
      const reportData = reportsRes.data || [];
      setReports(reportData);
      setEmployees(usersRes.data || []);
      calculateStats(reportData);
    } catch (error) {
      toast.error(error.message || 'Failed to load reports');
    }
  };

  const calculateStats = (reportsData) => {
    const totalHours = reportsData.reduce((sum, r) => sum + (parseFloat(r.hoursSpent) || 0), 0);
    const completedTasks = reportsData.filter(r => r.status === 'Completed').length;
    const pendingTasks = reportsData.filter(r => r.status === 'Pending').length;
    const inProgressTasks = reportsData.filter(r => r.status === 'In Progress').length;
    
    setStats({
      totalHours: totalHours.toFixed(1),
      completedTasks,
      pendingTasks,
      inProgressTasks
    });
  };

  const applyFilters = () => {
    let filtered = [...reports];
    
    if (filters.employee) {
      filtered = filtered.filter(r => r.userName === filters.employee);
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(r => new Date(r.date) >= new Date(filters.dateFrom));
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(r => new Date(r.date) <= new Date(filters.dateTo));
    }
    
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    setFilteredReports(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      employee: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('from', filters.dateFrom);
      if (filters.dateTo) params.append('to', filters.dateTo);
      if (filters.status) params.append('status', filters.status);
      if (filters.employee) {
        const employee = employees.find((emp) => emp.name === filters.employee);
        if (employee?._id) params.append('userId', employee._id);
      }
      params.append('exportCsv', 'true');
      await downloadFile(`/admin/reports/filter?${params.toString()}`, `work_reports_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to export CSV');
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Work Reports</h1>
        <p>View and analyze all employee work reports</p>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="summary-info">
            <h3>Total Hours</h3>
            <p className="summary-number">{stats.totalHours} hrs</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="summary-info">
            <h3>Completed</h3>
            <p className="summary-number">{stats.completedTasks}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <path d="M8 4v4" />
              <path d="M16 4v4" />
              <path d="M12 8v4" />
            </svg>
          </div>
          <div className="summary-info">
            <h3>In Progress</h3>
            <p className="summary-number">{stats.inProgressTasks}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="summary-info">
            <h3>Pending</h3>
            <p className="summary-number">{stats.pendingTasks}</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3>Filter Reports</h3>
          <button onClick={clearFilters} className="clear-filters-btn">Clear All</button>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Employee</label>
            <select name="employee" value={filters.employee} onChange={handleFilterChange}>
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>From Date</label>
            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>To Date</label>
            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="reports-actions">
        <button onClick={exportToCSV} className="export-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export to CSV
        </button>
        <div className="results-count">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>

      <div className="reports-list-section">
        {filteredReports.length === 0 ? (
          <div className="no-data">No reports found matching your filters</div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report, index) => (
              <div key={index} className="report-card">
                <div className="report-card-header">
                  <div className="employee-info">
                    <h4>{report.userName}</h4>
                    <span className="employee-email">{report.userEmail}</span>
                  </div>
                  <div className="report-date-badge">
                    {new Date(report.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="report-card-content">
                  <div className="report-field">
                    <strong>Project:</strong>
                    <span>{report.project}</span>
                  </div>
                  <div className="report-field">
                    <strong>Tasks:</strong>
                    <span>{report.tasks}</span>
                  </div>
                  <div className="report-field">
                    <strong>Hours Spent:</strong>
                    <span>{report.hoursSpent} hours</span>
                  </div>
                  <div className="report-field">
                    <strong>Status:</strong>
                    <span className={`status-badge status-${report.status.toLowerCase().replace(' ', '-')}`}>
                      {report.status}
                    </span>
                  </div>
                  {report.description && (
                    <div className="report-field">
                      <strong>Description:</strong>
                      <span>{report.description}</span>
                    </div>
                  )}
                  <div className="report-field">
                    <strong>Submitted:</strong>
                    <span className="submitted-time">
                      {new Date(report.submittedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;