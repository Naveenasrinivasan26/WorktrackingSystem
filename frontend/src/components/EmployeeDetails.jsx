import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

const EmployeeDetails = ({ user }) => {
  const [workReports, setWorkReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'employees'
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });
  const [newReport, setNewReport] = useState({
    taskName: '',
    taskDescription: '',
    hoursSpent: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    loadWorkReports();
    loadEmployees();
  }, []);

  const loadWorkReports = async () => {
    try {
      const response = await apiRequest('/admin/reports');
      setWorkReports(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load work reports');
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiRequest('/admin/users');
      setEmployees(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load employees');
    }
  };

  // Generate random password
  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setNewEmployee({ ...newEmployee, password });
  };

  // Handle Add Employee
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.phone) {
      toast.error('Please fill all required fields!');
      return;
    }

    // Check if email already exists
    const emailExists = employees.some(emp => emp.email === newEmployee.email);
    if (emailExists) {
      toast.error('Employee with this email already exists!');
      return;
    }
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newEmployee.name,
          email: newEmployee.email,
          phone: newEmployee.phone,
          password: newEmployee.password || 'Temp@12345',
          position: ''
        })
      });
      await loadEmployees();
      setNewEmployee({ name: '', email: '', phone: '', password: '', role: 'user' });
      setShowAddModal(false);
      toast.success('Employee added and credentials email triggered');
      window.dispatchEvent(new CustomEvent('work-data-changed'));
    } catch (error) {
      toast.error(error.message || 'Failed to add employee');
    }
  };

  const handleAddReport = async () => {
    if (newReport.taskName && newReport.hoursSpent) {
      try {
        await apiRequest('/work/entries', {
          method: 'POST',
          body: JSON.stringify({
            project: newReport.taskName,
            tasks: newReport.taskDescription || newReport.taskName,
            hoursSpent: Number(newReport.hoursSpent),
            date: newReport.date,
            status: newReport.status,
            description: newReport.taskDescription || ''
          })
        });
        await loadWorkReports();
      } catch (error) {
        toast.error(error.message || 'Failed to submit work report');
        return;
      }
      setNewReport({
        taskName: '',
        taskDescription: '',
        hoursSpent: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      });
      setShowAddModal(false);
      toast.success('Work report submitted successfully! Waiting for approval.');
      window.dispatchEvent(new CustomEvent('work-data-changed'));
    } else {
      toast.error('Please fill all required fields!');
    }
  };

  const handleAcceptReport = async (id) => {
    try {
      await apiRequest(`/admin/reports/${id}/approval`, {
        method: 'PUT',
        body: JSON.stringify({ approvalStatus: 'accepted' })
      });
      await loadWorkReports();
      toast.success('Report accepted successfully!');
      window.dispatchEvent(new CustomEvent('work-data-changed'));
    } catch (error) {
      toast.error(error.message || 'Failed to accept report');
    }
  };

  const handleRejectReport = async (id) => {
    try {
      await apiRequest(`/admin/reports/${id}/approval`, {
        method: 'PUT',
        body: JSON.stringify({
          approvalStatus: 'rejected',
          rejectionReason: 'Please revise and resubmit this update.'
        })
      });
      await loadWorkReports();
      toast.info('Report rejected. User can now edit and resubmit.');
      window.dispatchEvent(new CustomEvent('work-data-changed'));
    } catch (error) {
      toast.error(error.message || 'Failed to reject report');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
      await loadEmployees();
      toast.success('Employee deleted successfully!');
      window.dispatchEvent(new CustomEvent('work-data-changed'));
    } catch (error) {
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  const filteredReports = workReports.filter(report =>
    report.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.tasks && report.tasks.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.phone.includes(employeeSearchTerm)
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-progress';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  const getApprovalBadgeClass = (approvalStatus) => {
    switch(approvalStatus) {
      case 'accepted': return 'approval-accepted';
      case 'rejected': return 'approval-rejected';
      default: return 'approval-pending';
    }
  };

  const getApprovalText = (approvalStatus) => {
    switch(approvalStatus) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Pending Approval';
    }
  };

  return (
    <div className="employee-details-page">
      <div className="page-header">
        <div>
          <h1>Employee & Reports Management</h1>
          <p>Manage employees and approve work reports</p>
        </div>
        <button onClick={() => {
          setActiveTab('employees');
          setShowAddModal(true);
        }} className="add-employee-main-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Work Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Employees List
        </button>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={activeTab === 'reports' ? "Search by task name or description..." : "Search by name, email or phone..."}
            value={activeTab === 'reports' ? searchTerm : employeeSearchTerm}
            onChange={(e) => activeTab === 'reports' ? setSearchTerm(e.target.value) : setEmployeeSearchTerm(e.target.value)}
          />
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <div className="employee-stats">
          {activeTab === 'reports' ? (
            <>Total Reports: <strong>{workReports.length}</strong></>
          ) : (
            <>Total Employees: <strong>{employees.length}</strong></>
          )}
        </div>
      </div>

      {/* Work Reports Table Section */}
      {activeTab === 'reports' && (
        <div className="reports-table-section">
          <h3>Work Reports List</h3>
          <div className="reports-table-container">
            {filteredReports.length === 0 ? (
              <div className="no-reports-data">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <p>No work reports found.</p>
              </div>
            ) : (
              <table className="work-reports-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Task Name</th>
                    <th>Task Description</th>
                    <th>Hours Spent</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Approval Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <tr key={report._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="task-info-cell">
                          <span className="task-name">{report.project}</span>
                        </div>
                      </td>
                      <td className="task-description">
                        {report.tasks || 'No description provided'}
                      </td>
                      <td>
                        <span className="hours-badge">{report.hoursSpent} hrs</span>
                      </td>
                      <td>{new Date(report.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>
                        <span className={`approval-badge ${getApprovalBadgeClass(report.approvalStatus)}`}>
                          {getApprovalText(report.approvalStatus)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {report.approvalStatus === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleAcceptReport(report._id)} 
                                className="accept-btn"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Accept
                              </button>
                              <button 
                                onClick={() => handleRejectReport(report._id)} 
                                className="reject-btn"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className={`final-status ${report.approvalStatus}`}>
                              {report.approvalStatus === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Employees Table Section */}
      {activeTab === 'employees' && (
        <div className="reports-table-section">
          <h3>Employees List</h3>
          <div className="reports-table-container">
            {filteredEmployees.length === 0 ? (
              <div className="no-reports-data">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p>No employees found. Click "Add Employee" to create one.</p>
              </div>
            ) : (
              <table className="work-reports-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee, index) => (
                    <tr key={employee._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="task-info-cell">
                          <span className="task-name">{employee.name}</span>
                        </div>
                      </td>
                      <td>{employee.email}</td>
                      <td>{employee.phone}</td>
                      <td>
                        <span className={`role-badge ${employee.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                          {employee.role === 'admin' ? 'Admin' : 'Employee'}
                        </span>
                      </td>
                      <td>{new Date(employee.joinDate || employee.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleDeleteEmployee(employee._id)} 
                            className="delete-employee-btn"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Employee/Report Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{activeTab === 'employees' ? 'Add New Employee' : 'Add New Work Report'}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {activeTab === 'employees' ? (
                // Add Employee Form
                <>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      placeholder="Enter employee's full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      placeholder="employee@company.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-generator">
                      <input
                        type="text"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                        placeholder="Click Generate to create password"
                        readOnly
                      />
                      <button 
                        type="button"
                        onClick={generatePassword}
                        className="generate-password-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 2L9 14" />
                          <path d="M12 2L2 12" />
                          <path d="M21 2L15 8" />
                          <path d="M21 2L19 4" />
                          <circle cx="12" cy="12" r="3" />
                          <path d="M22 22L2 2" />
                        </svg>
                        Generate
                      </button>
                    </div>
                    {newEmployee.password && (
                      <small className="password-hint">Copy this password and share with employee securely</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      required
                    >
                      <option value="user">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              ) : (
                // Add Report Form (existing)
                <>
                  <div className="form-group">
                    <label>Task Name *</label>
                    <input
                      type="text"
                      value={newReport.taskName}
                      onChange={(e) => setNewReport({...newReport, taskName: e.target.value})}
                      placeholder="Enter task name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Task Description</label>
                    <textarea
                      value={newReport.taskDescription}
                      onChange={(e) => setNewReport({...newReport, taskDescription: e.target.value})}
                      placeholder="Enter task description"
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>Hours Spent *</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newReport.hoursSpent}
                      onChange={(e) => setNewReport({...newReport, hoursSpent: e.target.value})}
                      placeholder="Enter hours spent"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={newReport.date}
                      onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      value={newReport.status}
                      onChange={(e) => setNewReport({...newReport, status: e.target.value})}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={activeTab === 'employees' ? handleAddEmployee : handleAddReport} 
                className="save-btn"
              >
                {activeTab === 'employees' ? 'Add Employee' : 'Submit Report'}
              </button>
              <button onClick={() => setShowAddModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-navigation {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid #E5E7EB;
          padding-bottom: 12px;
        }
        
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6B7280;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .tab-btn:hover {
          background: #F5F5F4;
          color: #2D6A4F;
        }
        
        .tab-btn.active {
          background: #2D6A4F;
          color: white;
        }
        
        .password-generator {
          display: flex;
          gap: 10px;
        }
        
        .password-generator input {
          flex: 1;
        }
        
        .generate-password-btn {
          padding: 10px 16px;
          background: #2D6A4F;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .generate-password-btn:hover {
          background: #1F4D3A;
          transform: translateY(-2px);
        }
        
        .password-hint {
          display: block;
          margin-top: 6px;
          font-size: 11px;
          color: #F59E0B;
        }
        
        .role-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        
        .role-admin {
          background: #FEF3C7;
          color: #B45309;
        }
        
        .role-user {
          background: #D1FAE5;
          color: #065F46;
        }
        
        .delete-employee-btn {
          padding: 6px 14px;
          background: #DC2626;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .delete-employee-btn:hover {
          background: #B91C1C;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .tab-navigation {
            flex-direction: column;
          }
          
          .password-generator {
            flex-direction: column;
          }
          
          .generate-password-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDetails;