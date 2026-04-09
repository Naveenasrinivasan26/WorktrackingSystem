import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import Dashboard from './Dashboard';
import Reports from './Reports';
import EmployeeDetails from './EmployeeDetails';
import AdminProfile from './AdminProfile';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getPageTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'reports': return 'Work Reports & Analytics';
      case 'employees': return 'Employee Management';
      case 'profile': return 'Admin Profile';
      default: return 'Dashboard';
    }
  };

  const getPageDescription = () => {
    switch(activeTab) {
      case 'dashboard': return 'Welcome back! Here\'s your workspace overview';
      case 'reports': return 'View and analyze all employee work reports';
      case 'employees': return 'Manage all employees and their details';
      case 'profile': return 'Manage your profile information and view activity';
      default: return '';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="admin-dashboard-container">
      {/* Mobile Menu Toggle Button */}
      <button
        className="menu-toggle"
        aria-label="Toggle navigation menu"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {mobileMenuOpen && <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      <AdminNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogoutClick}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <div className="admin-main-content">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="topbar-title">
            <h1>{getPageTitle()}</h1>
            <p>{getPageDescription()}</p>
          </div>
          <div className="topbar-actions">
           
            <div className="user-menu" onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
              
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-page-content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="reports" element={<Reports user={user} />} />
            <Route path="employees" element={<EmployeeDetails user={user} />} />
            <Route path="profile" element={<AdminProfile user={user} />} />
          </Routes>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout from your account?</p>
            <div className="logout-modal-buttons">
              <button onClick={confirmLogout} className="confirm-logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
              <button onClick={cancelLogout} className="cancel-logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
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
  );
};

export default AdminDashboard;