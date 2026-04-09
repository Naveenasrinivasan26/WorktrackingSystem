import React, { useState } from 'react';
import icon from '../assets/icon.png'; // Import the icon
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

const AdminProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    role: 'Admin',
    position: user.position || '',
    phone: user.phone || '',
    location: user.location || '',
    joinDate: user.joinDate || new Date().toISOString(),
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Added new employee John Doe', date: '2024-01-15 10:30 AM' },
    { id: 2, action: 'Generated monthly report', date: '2024-01-14 04:45 PM' },
    { id: 3, action: 'Updated work policies', date: '2024-01-13 11:20 AM' },
    { id: 4, action: 'Reviewed work reports', date: '2024-01-12 09:15 AM' }
  ]);

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await apiRequest('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileData.name,
          position: profileData.position,
          phone: profileData.phone,
          location: profileData.location
        })
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="admin-profile-page">
      {/* <div className="page-header">
        <h1>Admin Profile</h1>
        <p>Manage your profile information and view activity</p>
      </div> */}

      <div className="profile-container">
        
          </div>
          <div className="profile-stats">
           

        <div className="profile-main">
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
                    <path d="M4 20h16" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-profile-btn">Save</button>
                  <button onClick={handleCancel} className="cancel-profile-btn">Cancel</button>
                </div>
              )}
            </div>
            <div className="profile-info">
              <div className="info-row">
                <div className="info-label">Full Name:</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{profileData.name}</div>
                )}
              </div>
              <div className="info-row">
                <div className="info-label">Email Address:</div>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{profileData.email}</div>
                )}
              </div>
              <div className="info-row">
                <div className="info-label">Role:</div>
                <div className="info-value role-badge">{profileData.role}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Position:</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{profileData.position}</div>
                )}
              </div>
              {/* <div className="info-row"> */}
                {/* <div className="info-label">Phone Number:</div>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{profileData.phone}</div>
                )}
              </div> */}
              <div className="info-row">
                <div className="info-label">Location:</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{profileData.location}</div>
                )}
              </div>
            </div>
          </div>

            <div className="security-card">
              <h2>Security Settings</h2>
              <div className="security-options">
                <div className="security-option">
                  <div className="option-info">
                    <h3>Change Password</h3>
                    <p>Current password is required for admin password changes.</p>
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <button
                    className="security-btn"
                    onClick={async () => {
                      if (!passwordData.currentPassword) {
                        toast.error('Current password is required');
                        return;
                      }
                      if (passwordData.newPassword.length < 6) {
                        toast.error('New password must be at least 6 characters');
                        return;
                      }
                      if (passwordData.newPassword !== passwordData.confirmPassword) {
                        toast.error('Password confirmation does not match');
                        return;
                      }
                      try {
                        await apiRequest('/auth/update-profile', {
                          method: 'PUT',
                          body: JSON.stringify({
                            currentPassword: passwordData.currentPassword,
                            password: passwordData.newPassword
                          })
                        });
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        toast.success('Password changed successfully');
                      } catch (error) {
                        toast.error(error.message || 'Failed to change password');
                      }
                    }}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default AdminProfile;