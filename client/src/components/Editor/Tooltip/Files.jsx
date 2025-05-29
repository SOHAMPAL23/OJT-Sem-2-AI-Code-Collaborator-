import React from 'react';

const Files = ({ onBack, files, onCreateFile, onRenameFile, onDeleteFile, newFileName, onNewFileNameChange, error, isCreatingFile, setIsCreatingFile, onFileClick, activeFieldId }) => {
  const handleCreateFile = () => {
    onCreateFile(newFileName);
  };

  return (
    <div className="files-panel">
      <button className="back-btn" onClick={onBack}>
        <span>←</span> Back
      </button>
      
      <div className="files-header">
        <h3>Files</h3>
        <button className="create-btn" onClick={() => setIsCreatingFile(true)}>
          + New File
        </button>
      </div>

      {isCreatingFile && (
        <div className="new-file-form">
          <input
            type="text"
            className="new-file-input"
            value={newFileName}
            onChange={(e) => onNewFileNameChange(e.target.value)}
            placeholder="Enter file name"
            autoFocus
          />
          <div className="file-actions">
            <button className="create-btn" onClick={handleCreateFile}>
              Create
            </button>
            <button
              className="action-btn"
              onClick={() => {
                setIsCreatingFile(false);
                onNewFileNameChange('');
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
    <div
      key={file.id}
      className={`file-item ${file.id === activeFieldId ? '.active' : ''}`}
      onClick={() => onFileClick(file.id)}                                
    >
      <span>{file.name}</span>
      <div className="file-actions">
        <button
          className="action-btn"
          onClick={(e) => {
            e.stopPropagation();            
            onDeleteFile(file.id);
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
};

export default Files; 