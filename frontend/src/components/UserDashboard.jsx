import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

const UserDashboard = ({ user, onLogout }) => {
  const [workEntries, setWorkEntries] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    tasks: '',
    hoursSpent: '',
    status: 'In Progress',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      project: '',
      tasks: '',
      hoursSpent: '',
      status: 'In Progress',
      description: ''
    });
  };

  const loadEntries = async () => {
    try {
      const response = await apiRequest('/work/entries');
      setWorkEntries(response.data || []);
      const rejected = (response.data || []).filter((entry) => entry.approvalStatus === 'rejected' && entry.canEdit);
      if (rejected.length > 0) {
        toast.info(`You have ${rejected.length} rejected report(s) ready for edit.`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load work entries');
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await apiRequest(`/work/entries/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        toast.success('Work update edited and resubmitted successfully!');
        setEditingId(null);
      } else {
        await apiRequest('/work/entries', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast.success('Work update submitted successfully! Waiting for admin approval.');
      }

      resetForm();
      await loadEntries();
      window.dispatchEvent(new CustomEvent('work-data-changed'));
    } catch (error) {
      toast.error(error.message || 'Failed to save work update');
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
    if (!passwordData.newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }
    
    try {
      await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({ password: passwordData.newPassword })
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password updated successfully!');
      setTimeout(() => {
        setShowSettingsModal(false);
        setPasswordSuccess('');
        toast.success('Password updated! Please login again.');
        onLogout();
      }, 1200);
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  const handleEdit = (entry) => {
    if (entry.approvalStatus === 'rejected') {
      setEditingId(entry._id);
      setFormData({
        date: entry.date,
        project: entry.project,
        tasks: entry.tasks,
        hoursSpent: entry.hoursSpent,
        status: entry.status,
        description: entry.description || ''
      });
      document.querySelector('.update-form-section').scrollIntoView({ behavior: 'smooth' });
    } else if (entry.approvalStatus === 'pending') {
      toast.info('This report is pending admin approval. You cannot edit it until it is rejected.');
    } else if (entry.approvalStatus === 'accepted') {
      toast.info('This report has been accepted. You cannot edit accepted reports.');
    }
  };

  const handleDelete = (id) => {
    const entryToDelete = workEntries.find(entry => entry._id === id);
    if (entryToDelete.approvalStatus === 'accepted') {
      toast.info('Cannot delete accepted reports. Please contact admin.');
      return;
    }
    if (entryToDelete.approvalStatus === 'pending') {
      toast.info('Cannot delete reports pending approval. Please wait for admin response or contact admin.');
      return;
    }
    setDeleteConfirm(entryToDelete._id);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/work/entries/${deleteConfirm}`, { method: 'DELETE' });
      toast.success('Work entry deleted successfully!');
      setDeleteConfirm(null);
      await loadEntries();
      window.dispatchEvent(new CustomEvent('work-data-changed'));
    } catch (error) {
      toast.error(error.message || 'Failed to delete work entry');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      project: '',
      tasks: '',
      hoursSpent: '',
      status: 'In Progress',
      description: ''
    });
  };

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
      case 'accepted': return '✓ Accepted';
      case 'rejected': return '✗ Rejected';
      default: return '⏳ Pending Approval';
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const openSettings = () => {
    setShowUserMenu(false);
    setShowSettingsModal(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome, {user.name}!</h1>
            <p>Daily Work Update Portal</p>
          </div>
          <div className="header-actions">
            <div className="user-menu-container">
              <button onClick={toggleUserMenu} className="user-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {user.name}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={openSettings} className="dropdown-settings-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.04.04A10 10 0 0 0 12 17.66a10 10 0 0 0 6.36-2.62l.04-.04z" />
                      <line x1="12" y1="2" x2="12" y2="4" />
                      <line x1="12" y1="20" x2="12" y2="22" />
                    </svg>
                    Settings
                  </button>
                  <button onClick={onLogout} className="dropdown-logout-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="update-form-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            {editingId ? 'Edit Work Update' : 'Daily Work Update'}
          </h2>
          <form onSubmit={handleSubmit} className="work-form">
            <div className="form-row-2cols">
              <div className="form-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                  Task Name
                </label>
                <input
                  type="text"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                />
              </div>
            </div>

            <div className="form-row-full">
              <div className="form-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Tasks Description
                </label>
                <textarea
                  name="tasks"
                  value={formData.tasks}
                  onChange={handleChange}
                  placeholder="List the tasks you completed today..."
                  rows="3"
                  required
                />
              </div>
            </div>

            <div className="form-row-2cols-equal">
              <div className="form-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Hours Spent
                </label>
                <input
                  type="number"
                  name="hoursSpent"
                  value={formData.hoursSpent}
                  onChange={handleChange}
                  placeholder="Enter hours"
                  step="0.5"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                </svg>
                {editingId ? 'Update Work' : 'Submit Work'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="history-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Work History
          </h2>
          {workEntries.length === 0 ? (
            <div className="no-data">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <p>No work updates yet. Start by submitting your first update!</p>
            </div>
          ) : (
            <div className="entries-list">
              {workEntries.map(entry => (
                <div key={entry._id} className="entry-card">
                  <div className="entry-header">
                    <div>
                      <h3>{entry.project}</h3>
                      <div className="badges-container">
                        <span className={`status-badge ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                        <span className={`approval-badge ${getApprovalBadgeClass(entry.approvalStatus)}`}>
                          {getApprovalText(entry.approvalStatus)}
                        </span>
                      </div>
                    </div>
                    <div className="entry-actions">
                      <button 
                        onClick={() => handleEdit(entry)} 
                        className={`edit-btn ${entry.approvalStatus !== 'rejected' ? 'disabled' : ''}`}
                        disabled={entry.approvalStatus !== 'rejected'}
                        title={entry.approvalStatus !== 'rejected' ? 'Only rejected reports can be edited' : 'Edit report'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                          <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                          <path d="M4 20h16" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(entry._id)} 
                        className={`delete-btn ${entry.approvalStatus !== 'rejected' ? 'disabled' : ''}`}
                        disabled={entry.approvalStatus !== 'rejected'}
                        title={entry.approvalStatus !== 'rejected' ? 'Only rejected reports can be deleted' : 'Delete report'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="entry-details">
                    <p>
                      <strong>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Date:
                      </strong> 
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                        Tasks:
                      </strong> 
                      {entry.tasks}
                    </p>
                    <p>
                      <strong>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Hours:
                      </strong> 
                      {entry.hoursSpent} hrs
                    </p>
                    {entry.description && (
                      <p>
                        <strong>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          Notes:
                        </strong> 
                        {entry.description}
                      </p>
                    )}
                    {entry.rejectionReason && entry.approvalStatus === 'rejected' && (
                      <p className="rejection-reason">
                        <strong>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          Rejection Reason:
                        </strong> 
                        {entry.rejectionReason}
                      </p>
                    )}
                    <p className="submitted-time">
                      <small>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Submitted: {new Date(entry.submittedAt).toLocaleString()}
                      </small>
                    </p>
                  </div>

                  {deleteConfirm === entry._id && (
                    <div className="delete-confirm-overlay">
                      <div className="delete-confirm-modal">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>Are you sure you want to delete this work entry?</p>
                        <div className="delete-confirm-buttons">
                          <button onClick={confirmDelete} className="confirm-delete-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Yes, Delete
                          </button>
                          <button onClick={cancelDelete} className="cancel-delete-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal for Password Change */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H5.78a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.04.04A10 10 0 0 0 12 17.66a10 10 0 0 0 6.36-2.62l.04-.04z" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                </svg>
                Change Password
              </h2>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {passwordError && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="success-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {passwordSuccess}
                </div>
              )}
              
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>
                <small className="password-hint">Password must be at least 6 characters long</small>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleUpdatePassword} className="update-password-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                </svg>
                Update Password
              </button>
              <button onClick={() => setShowSettingsModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;