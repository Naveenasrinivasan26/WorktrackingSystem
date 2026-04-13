import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = ({ activeTab, setActiveTab, user, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();

  const handleTabChange = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className={`admin-navbar ${mobileMenuOpen ? 'open' : ''}`}>
      <div className="navbar-header">
        <h2>WorkTrack Admin</h2>
        <p>Welcome, {user.name}</p>
      </div>
      
      <div className="navbar-menu">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard', '/admin/dashboard')}
        >
          <span className="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M12 17V5" />
              <path d="M6 17v-3" />
            </svg>
          </span>
          <span className="nav-text">Dashboard</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => handleTabChange('reports', '/admin/reports')}
        >
          <span className="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </span>
          <span className="nav-text">Reports</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => handleTabChange('employees', '/admin/employees')}
        >
          <span className="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span className="nav-text">Employees</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile', '/admin/profile')}
        >
          <span className="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="nav-text">Profile</span>
        </button>
      </div>
      
      
    </div>
  );
};

export default AdminNavbar;