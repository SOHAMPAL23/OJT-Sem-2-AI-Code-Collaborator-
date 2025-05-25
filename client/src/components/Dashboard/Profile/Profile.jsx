import React from 'react';

const Profile = ({ profileData, isEditing, handleProfileChange, handleProfileEdit }) => {
  return (
    <div id="profile-section">
      <div className="profile-container">
        <h2 className="profile-title">Profile</h2>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={profileData.username}
            onChange={handleProfileChange}
            placeholder="Enter your username"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label htmlFor="languages">Expertise Languages</label>
          <input
            type="text"
            id="languages"
            name="languages"
            value={profileData.languages}
            onChange={handleProfileChange}
            placeholder="e.g., JavaScript, Python, Java, C++"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label htmlFor="field">Expertise Field</label>
          <input
            type="text"
            id="field"
            name="field"
            value={profileData.field}
            onChange={handleProfileChange}
            placeholder="e.g., Frontend Development, Backend Development"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label htmlFor="experience">Experience (years)</label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={profileData.experience}
            onChange={handleProfileChange}
            placeholder="Years of experience"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio}
            onChange={handleProfileChange}
            placeholder="Tell us about yourself, your journey, and your passion for coding..."
            rows="5"
            readOnly={!isEditing}
          />
        </div>

        <button className="edit-profile" onClick={handleProfileEdit}>
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>
    </div>
  );
};

export default Profile; 