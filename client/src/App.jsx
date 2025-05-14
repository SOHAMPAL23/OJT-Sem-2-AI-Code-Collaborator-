import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePanel, setActivePanel] = useState('files');
  const [files, setFiles] = useState([]);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState('');
  const [isRenaming, setIsRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [showToolkitPanel, setShowToolkitPanel] = useState(false);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [toolkitWidth, setToolkitWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const toolkitRef = useRef(null);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [roomMode, setRoomMode] = useState('create');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    usergeneratedname: '',
    email: '',
    description: '',
    company: '',
    languages: []
  });
  const navigate = useNavigate();

  const handleRoomClick = () => {
    setShowRoomModal(true);
  };

  const handleCreateRoom = (password) => {
    const newUser = {
      id: Date.now().toString(),
      name: 'You',
      role: 'admin',
      isAdmin: true
    };
    setCurrentUser(newUser);
    setParticipants([newUser]);
    setIsRoomModalOpen(false);
  };

  const handleJoinRoom = (roomId, password) => {
    const newUser = {
      id: Date.now().toString(),
      name: 'You',
      role: 'viewer',
      isAdmin: false
    };
    setCurrentUser(newUser);
    setParticipants(prev => [...prev, newUser]);
    setIsRoomModalOpen(false);
  };

  const handleRoleChange = (participantId, newRole) => {
    setParticipants(prev => 
      prev.map(p => p.id === participantId ? { ...p, role: newRole } : p)
    );
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      setError('File name cannot be empty');
      return;
    }
    if (files.some(f => f.name === newFileName)) {
      setError('File with this name already exists');
      return;
    }
    setFiles(prev => [...prev, { id: Date.now(), name: newFileName }]);
    setNewFileName('');
    setIsCreatingFile(false);
    setError('');
  };

  const handleDeleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleRenameFile = (fileId, newName) => {
    if (!newName.trim()) {
      setError('File name cannot be empty');
      return;
    }
    if (files.some(f => f.name === newName && f.id !== fileId)) {
      setError('File with this name already exists');
      return;
    }
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f));
    setIsRenaming(null);
    setRenameValue('');
    setError('');
  };

  const handlePanelClick = (panel) => {
    setActivePanel(panel);
    setShowToolkitPanel(true);
  };

  const handleBackClick = () => {
    setShowToolkitPanel(false);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    document.documentElement.style.fontSize = 
      size === 'small' ? '14px' : 
      size === 'medium' ? '16px' : '18px';
  };

  const handleBackFromRoom = () => {
    setShowRoomModal(false);
    setRoomMode(null);
  };

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setToolkitWidth(newWidth);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : '';
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      console.log('Fetching profile with token:', token);

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
      console.log('Fetched profile data:', data);
      
      setProfileData({
        usergeneratedname: data.usergeneratedname || '',
        email: data.email || '',
        description: data.description || '',
        company: data.company || '',
        languages: data.languages || []
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (showProfileModal) {
      fetchProfileData();
    }
  }, [showProfileModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!profileData.usergeneratedname.trim()) {
        alert('Generated name cannot be empty');
        return;
      }

      console.log('Saving profile data:', profileData);

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      console.log('Save profile response:', data);
      
      if (response.ok) {
        setProfileData(data);
        setShowProfileModal(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.msg || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="header">
        <div className="header-container">
          <div className="logo">
            <h1>Code Crux</h1>
          </div>
          <div className="nav">
            <button className="nav-link">Home</button>
            <button className="nav-link" onClick={handleRoomClick}>Room</button>
            <button className="nav-link" onClick={handleProfileClick}>Profile</button>
          </div>
          <button className="share-btn">
            
            Share
          </button>
          <button className="nav-link" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="main">
        {/* Toolkit */}
        <div className="toolkit">
          {!showFilesPanel ? (
            <>
              <div className="toolkit-nav">
                <button 
                  className="toolkit-btn"
                  onClick={() => setShowFilesPanel(true)}
                >
                  <span className="toolkit-icon">📁</span>
                  Files
                </button>
                <button className="toolkit-btn">
                  <span className="toolkit-icon">💬</span>
                  Chat
                </button>
                <button className="toolkit-btn">
                  <span className="toolkit-icon">👥</span>
                  Participants
                </button>
                <button className="toolkit-btn">
                  <span className="toolkit-icon">⚙️</span>
                  Settings
                </button>
              </div>
              
              <div className="theme-toggle">
                <button 
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={toggleTheme}
                >
                  <span className="theme-icon">
                    {theme === 'light' ? '🌙' : '☀️'}
                  </span>
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
            </>
          ) : (
            <div className="files-panel">
              <button 
                className="back-btn"
                onClick={() => setShowFilesPanel(false)}
              >
                <span>←</span> Back
              </button>
              
              <div className="files-header">
                <h3>Files</h3>
                <button 
                  className="create-btn"
                  onClick={() => setIsCreatingFile(true)}
                >
                  + New File
                </button>
              </div>

              {isCreatingFile && (
                <div className="new-file-form">
                  <input
                    type="text"
                    className="new-file-input"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name"
                    autoFocus
                  />
                  <div className="file-actions">
                    <button 
                      className="create-btn"
                      onClick={handleCreateFile}
                    >
                      Create
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => {
                        setIsCreatingFile(false);
                        setNewFileName('');
                        setError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="file-list">
                {files.map(file => (
                  <div key={file.id} className="file-item">
                    {isRenaming === file.id ? (
                      <input
                        type="text"
                        className="new-file-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameFile(file.id, renameValue)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameFile(file.id, renameValue);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span>{file.name}</span>
                        <div className="file-actions">
                          <button 
                            className="action-btn"
                            onClick={() => {
                              setIsRenaming(file.id);
                              setRenameValue(file.name);
                            }}
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="workspace">
          <div className="code-editor">
            {/* Editor content */}
          </div>
        </div>
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="room-modal-overlay">
          <div className="room-modal-content">
            <button className="modal-back-btn" onClick={handleBackFromRoom}>
              <span className="back-icon">←</span>
              Back
            </button>
            
            {roomMode === null ? (
              <div className="room-options">
                <h2>Welcome to Code Crux</h2>
                <p className="room-options-subtitle">
                  Choose how you want to collaborate
                </p>
                
                <div className="room-options-grid">
                  <div 
                    className="room-option-card"
                    onClick={() => setRoomMode('create')}
                  >
                    <span className="room-option-icon">🏗️</span>
                    <h3 className="room-option-title">Create Room</h3>
                    <p className="room-option-description">
                      Start a new collaboration room and invite others to join. You'll be the admin of the room.
                    </p>
                  </div>

                  <div 
                    className="room-option-card"
                    onClick={() => setRoomMode('join')}
                  >
                    <span className="room-option-icon">🚪</span>
                    <h3 className="room-option-title">Join Room</h3>
                    <p className="room-option-description">
                      Join an existing room using a room ID and password provided by the room admin.
                    </p>
                  </div>
                </div>
              </div>
            ) : roomMode === 'create' ? (
              <div className="room-form">
                <h2>Create New Room</h2>
                <div className="room-input-group">
                  <label className="room-input-label">Room Password</label>
                  <div className="room-input-wrapper">
                    <span className="room-input-icon">🔒</span>
                    <input
                      type="password"
                      className="room-input"
                      placeholder="Enter room password"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="room-button-group">
                  <button 
                    className="room-submit-btn"
                    onClick={() => handleCreateRoom(roomPassword)}
                  >
                    <span>OK</span>
                  </button>
                  <button 
                    className="room-cancel-btn"
                    onClick={() => setRoomMode(null)}
                  >
                    <span>Back</span>
                  </button>
                </div>
              </div>
            ) : roomMode === 'join' ? (
              <div className="room-form">
                <h2>Join Room</h2>
                <div className="room-input-group">
                  <label className="room-input-label">Room ID</label>
                  <div className="room-input-wrapper">
                    <span className="room-input-icon">🔑</span>
                    <input
                      type="text"
                      className="room-input"
                      placeholder="Enter room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="room-input-group">
                  <label className="room-input-label">Room Password</label>
                  <div className="room-input-wrapper">
                    <span className="room-input-icon">🔒</span>
                    <input
                      type="password"
                      className="room-input"
                      placeholder="Enter room password"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="room-button-group">
                  <button 
                    className="room-submit-btn"
                    onClick={() => handleJoinRoom(roomId, roomPassword)}
                  >
                    <span>Join</span>
                  </button>
                  <button 
                    className="room-cancel-btn"
                    onClick={() => setRoomMode(null)}
                  >
                    <span>Back</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="room-modal-overlay">
          <div className="profile-modal-content">
            <button className="modal-back-btn" onClick={() => setShowProfileModal(false)}>
              <span className="back-icon">←</span>
              Back
            </button>
            
            <div className="profile-form">
              <h2>Your Profile</h2>
              
              <div className="profile-input-group">
                <label className="profile-input-label">Generated Name</label>
                <div className="profile-input-wrapper">
                  <span className="profile-input-icon">🎲</span>
                  <input
                    type="text"
                    name="usergeneratedname"
                    className="profile-input"
                    value={profileData.usergeneratedname || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your generated name"
                    required
                  />
                </div>
                <p className="profile-help-text">You can change your generated name</p>
              </div>

              <div className="profile-input-group">
                <label className="profile-input-label">Email</label>
                <div className="profile-input-wrapper">
                  <span className="profile-input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    className="profile-input"
                    value={profileData.email || ''}
                    disabled
                    placeholder="Your email"
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label className="profile-input-label">About You</label>
                <div className="profile-input-wrapper">
                  <span className="profile-input-icon">👨‍💻</span>
                  <select
                    className="profile-select"
                    value={profileData.description}
                    onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                  >
                    <option value="">Select your role</option>
                    <option value="designer">Designer</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                    <option value="fullstack">Full Stack Developer</option>
                    <option value="devops">DevOps Engineer</option>
                    <option value="mobile">Mobile Developer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="profile-input-group">
                <label className="profile-input-label">Company</label>
                <div className="profile-input-wrapper">
                  <span className="profile-input-icon">🏢</span>
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="Where do you work?"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label className="profile-input-label">Expertise Languages</label>
                <div className="profile-input-wrapper">
                  <span className="profile-input-icon">👨‍💻</span>
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="e.g., JavaScript, Java, Python (comma separated)"
                    value={profileData.languages.join(', ')}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      languages: e.target.value.split(',').map(lang => lang.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </div>

              <div className="profile-button-group">
                <button 
                  className="profile-submit-btn"
                  onClick={handleSaveProfile}
                >
                  <span>Save Profile</span>
                </button>
                <button 
                  className="profile-cancel-btn"
                  onClick={() => setShowProfileModal(false)}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;