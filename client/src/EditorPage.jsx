import React, { useState, useRef } from 'react';
import './App.css';
import { useTheme } from './context/ThemeContext';
import Compiler from './Compiler/Compiler';
import Navbar from './components/Editor/Navbar/Navbar';
import Tooltip from './components/Editor/Tooltip/Tooltip';
import RoomModal from './components/Editor/Modals/RoomModal';
import ProfileModal from './components/Editor/Modals/ProfileModal';

function EditorPage() {
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: Date.now().toString(),
    name: 'You',
    role: 'admin',
    isAdmin: true
  });
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isRenaming, setIsRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    autoSave: true,
    codeTheme: 'vs-dark',
    fontSize: 14,
    tabSize: 2
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isDarkTheme, toggleTheme } = useTheme();

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

  const handleNewFileNameChange = (value) => {
    setNewFileName(value);
    setError(''); // Clear error when user starts typing
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

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleRoleChange = (participantId, newRole) => {
    if (participantId === currentUser.id) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
    setParticipants(prev => 
      prev.map(p => p.id === participantId ? { ...p, role: newRole } : p)
    );
  };

  return (
    <div className={`app-container ${isDarkTheme ? 'dark' : 'light'}`}>
      <Navbar
        handleRoomClick={() => setShowRoomModal(true)}
        handleProfileClick={() => setShowProfileModal(true)}
      />

      <div className="main">
        <div className="toolkit">
          <Tooltip
            showFilesPanel={showFilesPanel}
            showChatPanel={showChatPanel}
            showSettingsPanel={showSettingsPanel}
            showParticipantsPanel={showParticipantsPanel}
            onShowFilesPanel={setShowFilesPanel}
            onShowChatPanel={setShowChatPanel}
            onShowSettingsPanel={setShowSettingsPanel}
            onShowParticipantsPanel={setShowParticipantsPanel}
            files={files}
            onCreateFile={handleCreateFile}
            onNewFileNameChange={handleNewFileNameChange}
            newFileName={newFileName}
            error={error}
            isCreatingFile={isCreatingFile}
            setIsCreatingFile={setIsCreatingFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
            settings={settings}
            onSettingChange={handleSettingChange}
            currentUser={currentUser}
            participants={participants}
            onRoleChange={handleRoleChange}
            isDarkTheme={isDarkTheme}
            toggleTheme={toggleTheme}
          />
        </div>

        <div className="workspace">
          <div className="code-editor">
            <Compiler/>
          </div>
        </div>
      </div>

      {showRoomModal && (
        <RoomModal
          onClose={() => setShowRoomModal(false)}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

export default EditorPage;