import React, { useState, useEffect } from 'react';
import './Profile.css';

const ProfileModal = ({ onSave, isEditing, onEdit, onClose, profileData: initialProfileData, onChange }) => {
  const [profileData, setProfileData] = useState({
    usergeneratedname: '',
    email: '',
    description: '',
    company: '',
    languages: [],
    field: '',
    experience: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!profileData.usergeneratedname.trim()) {
      newErrors.usergeneratedname = 'Username is required';
    }
    if (profileData.experience && (isNaN(profileData.experience) || profileData.experience < 0)) {
      newErrors.experience = 'Experience must be a valid positive number';
    }
    if (!profileData.field.trim()) {
      newErrors.field = 'Expertise field is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return;
      }

      const data = await response.json();
      setProfileData({
        usergeneratedname: data.usergeneratedname || '',
        email: data.email || '',
        description: data.description || '',
        company: data.company || '',
        languages: data.languages || [],
        field: data.field || '',
        experience: data.experience || '',
        bio: data.bio || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...profileData,
      [name]: value
    };
    setProfileData(updatedData);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (onChange) {
      onChange(updatedData);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onSave(data);
        if (onClose) onClose();
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } else {
        throw new Error(data.msg || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="profile-section">
      <div className={`profile-container ${loading ? 'loading' : ''}`}>
        <h2 className="profile-title">Profile</h2>
        <div className="input-group">
          <label htmlFor="usergeneratedname">Username</label>
          <input
            type="text"
            id="usergeneratedname"
            name="usergeneratedname"
            value={profileData.usergeneratedname}
            onChange={handleInputChange}
            placeholder="Enter your username"
            readOnly={!isEditing}
            className={errors.usergeneratedname ? 'input-error' : ''}
          />
          {errors.usergeneratedname && (
            <div className="error-message">{errors.usergeneratedname}</div>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            className="profile-input"
            value={profileData.email}
            disabled
            placeholder="Your email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="field">Expertise Field</label>
          <input
            type="text"
            id="field"
            name="field"
            value={profileData.field}
            onChange={handleInputChange}
            placeholder="e.g., Frontend Development, Backend Development"
            readOnly={!isEditing}
            className={errors.field ? 'input-error' : ''}
          />
          {errors.field && (
            <div className="error-message">{errors.field}</div>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="experience">Experience (years)</label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={profileData.experience}
            onChange={handleInputChange}
            placeholder="Years of experience"
            readOnly={!isEditing}
            min="0"
            className={errors.experience ? 'input-error' : ''}
          />
          {errors.experience && (
            <div className="error-message">{errors.experience}</div>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself, your journey, and your passion for coding..."
            rows="5"
            readOnly={!isEditing}
          />
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button 
                className="save-profile" 
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-profile" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              className="edit-profile" 
              onClick={onEdit}
              disabled={loading}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 