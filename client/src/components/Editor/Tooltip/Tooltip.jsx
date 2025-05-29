import React from 'react';
import Files from './Files';
import Settings from './Settings';
import Participants from './Participants';
import Chat from '../../../Chat/Chat';
import '../../../EditorPage.css';

const Tooltip = ({
  showFilesPanel,
  showChatPanel,
  showSettingsPanel,
  showParticipantsPanel,
  onShowFilesPanel,
  onShowChatPanel,
  onShowSettingsPanel,
  onShowParticipantsPanel,
  files,
  onCreateFile,
  onNewFileNameChange,
  newFileName,
  error,
  isCreatingFile,
  setIsCreatingFile,
  onRenameFile,
  onDeleteFile,
  settings,
  onSettingChange,
  currentUser,
  participants,
  onRoleChange,
  isDarkTheme,
  toggleTheme,
  onFileClick={onFileClick},           
  activeFileId={activeFileId} 
}) => {
  if (!showFilesPanel && !showChatPanel && !showSettingsPanel && !showParticipantsPanel) {
    return (
      <>
        <div className="toolkit-nav">
          <button 
            className="toolkit-btn"
            onClick={() => onShowFilesPanel(true)}
          >
            <span className="toolkit-icon"></span>
            Files
          </button>
          <button 
            className="toolkit-btn"
            onClick={() => onShowChatPanel(true)}
          >
            <span className="toolkit-icon"></span>
            Room
          </button>
          <button 
            className="toolkit-btn"
            onClick={() => onShowParticipantsPanel(true)}
          >
            <span className="toolkit-icon"></span>
            Participants
          </button>
          <button 
            className="toolkit-btn"
            onClick={() => onShowSettingsPanel(true)}
          >
            <span className="toolkit-icon"></span>
            Settings
          </button>
        </div>
        
        <div className="theme-toggle">
          <button 
            className={`theme-btn ${isDarkTheme ? 'active' : ''}`}
            onClick={toggleTheme}
          >
            <span className="theme-icon">
              {isDarkTheme ? '☀️' : '🌙'}
            </span>
            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {showFilesPanel && (
        <Files
          onBack={() => onShowFilesPanel(false)}
          files={files}
          onCreateFile={onCreateFile}
          onNewFileNameChange={onNewFileNameChange}
          newFileName={newFileName}
          error={error}
          isCreatingFile={isCreatingFile}
          setIsCreatingFile={setIsCreatingFile}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
          onFileClick={onFileClick}
          activeFileId={activeFileId}
        />
      )}

      {showChatPanel && (
        <div className="chat-panel">
          <div className="panel-header">
            <button className="back-btn" onClick={() => onShowChatPanel(false)}>
              <span>←</span> Back
            </button>
            <h3>Chat</h3>
          </div>
          <Chat darkMode={isDarkTheme}/>
        </div>
      )}

      {showParticipantsPanel && (
        <Participants
          onBack={() => onShowParticipantsPanel(false)}
          currentUser={currentUser}
          participants={participants}
          onRoleChange={onRoleChange}
        />
      )}

      {showSettingsPanel && (
        <Settings
          onBack={() => onShowSettingsPanel(false)}
          settings={settings}
          onSettingChange={onSettingChange}
        />
      )}
    </>
  );
};

export default Tooltip; 