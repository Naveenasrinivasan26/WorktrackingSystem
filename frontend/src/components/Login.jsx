import React, { useState } from 'react';
import icon from '../assets/icon.png';
import { toast } from 'react-toastify';
import { apiRequest } from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryCompany, setEnquiryCompany] = useState('');
  const [enquiryWorkEmail, setEnquiryWorkEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryTeamSize, setEnquiryTeamSize] = useState('');
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
      toast.success('Login successful');
    } catch (requestError) {
      setError(requestError.message || 'Invalid email or password.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/enquiry/submit', {
        method: 'POST',
        body: JSON.stringify({
          companyName: enquiryCompany,
          workEmail: enquiryWorkEmail,
          phoneNumber: enquiryPhone,
          teamSize: enquiryTeamSize
        })
      });

      setEnquirySubmitted(true);
      setTimeout(() => {
        setShowEnquiryModal(false);
        setEnquirySubmitted(false);
        setEnquiryCompany('');
        setEnquiryWorkEmail('');
        setEnquiryPhone('');
        setEnquiryTeamSize('');
      }, 2000);
    } catch (requestError) {
      toast.error(requestError.message || 'Failed to submit enquiry');
    }
  };

  const openEnquiryModal = () => {
    setShowEnquiryModal(true);
    setEnquirySubmitted(false);
  };

  const closeEnquiryModal = () => {
    setShowEnquiryModal(false);
    setEnquirySubmitted(false);
    setEnquiryCompany('');
    setEnquiryWorkEmail('');
    setEnquiryPhone('');
    setEnquiryTeamSize('');
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="header-flex">
              <img src={icon} alt="icon" className="logo" />
              <div>
                <h2>Work Tracking System</h2>
                <p>Daily Work Update Portal</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  className="eye-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <a href="#" onClick={async (event) => {
                event.preventDefault();
                if (!email) {
                  toast.info('Enter your email first to reset password');
                  return;
                }

                try {
                  await apiRequest('/auth/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify({ email })
                  });
                  toast.success('If your account exists, reset instructions were sent.');
                } catch (requestError) {
                  toast.error(requestError.message || 'Failed to request reset link');
                }
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 8 12 12 16 14" />
                </svg>
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="error-message">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Login
            </button>

            {/* Enquiry Link */}
            <div className="enquiry-link-container">
              <p className="enquiry-text">
                Enquiry for an account?{' '}
                <button 
                  type="button" 
                  className="enquiry-now-btn"
                  onClick={openEnquiryModal}
                >
                  Enquiry now
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="modal-overlay" onClick={closeEnquiryModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Account Enquiry</h3>
              <button className="modal-close-btn" onClick={closeEnquiryModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {!enquirySubmitted ? (
              <form onSubmit={handleEnquirySubmit} className="enquiry-form">
                <div className="enquiry-form-group">
                  <label>Company Name *</label>
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                    <input
                      type="text"
                      value={enquiryCompany}
                      onChange={(e) => setEnquiryCompany(e.target.value)}
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                </div>

                <div className="enquiry-form-group">
                  <label>Work Email *</label>
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      value={enquiryWorkEmail}
                      onChange={(e) => setEnquiryWorkEmail(e.target.value)}
                      placeholder="yourname@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="enquiry-form-group">
                  <label>Phone Number *</label>
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                </div>

                <div className="enquiry-form-group">
                  <label>Team Size *</label>
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <select
                      value={enquiryTeamSize}
                      onChange={(e) => setEnquiryTeamSize(e.target.value)}
                      required
                    >
                      <option value="">Select team size</option>
                      <option value="1-5">1-5 employees</option>
                      <option value="6-10">6-10 employees</option>
                      <option value="11-25">11-25 employees</option>
                      <option value="26-50">26-50 employees</option>
                      <option value="51-100">51-100 employees</option>
                      <option value="101-500">101-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="enquiry-submit-btn">
                  Submit Enquiry
                </button>
                <p className="enquiry-note">
                  Our team will contact you within 24-48 hours
                </p>
              </form>
            ) : (
              <div className="enquiry-success">
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h4>Enquiry Submitted!</h4>
                <p>Thank you for your interest in Work Tracking System.</p>
                <p>Our sales team will get back to you within 24-48 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Login;