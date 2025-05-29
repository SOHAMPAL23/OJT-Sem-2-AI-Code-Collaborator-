import React, { useState } from 'react';
import './EditorPage.css';
import { useTheme } from './context/ThemeContext';
import Compiler from './Compiler/Compiler';
import Navbar from './components/Editor/Navbar/Navbar';
import Tooltip from './components/Editor/Tooltip/Tooltip';
import RoomModal from './components/Editor/Modals/RoomModal';
import ProfileModal from './components/Dashboard/Profile/Profile';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


function EditorPage() {
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : {
      id: Date.now().toString(),
      name: 'You',
      role: 'admin',
      isAdmin: true
    };
  });

  const [editorLanguage, setEditorLanguage] = useState('python');
  const [editorVersion, setEditorVersion] = useState('3.10.0');
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('files');
    return saved ? JSON.parse(saved) : [];
  });

  const [fileContents, setFileContents] = useState(() => {
    const saved = localStorage.getItem('fileContents');
    return saved ? JSON.parse(saved) : {};
  });

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    autoSave: true,
    codeTheme: 'vs-dark',
    fontSize: 14,
    tabSize: 2
  });

  const roomId = localStorage.getItem('roomId') || '';
  const { isDarkTheme, toggleTheme } = useTheme();
  const [roomId, setRoomId] = useState('');
  const [activeFileId, setActiveFileId] = useState(null);
  const [code, setCode] = useState('def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()');

  // Persist files, fileContents, user, roomId
  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('fileContents', JSON.stringify(fileContents));
  }, [fileContents]);

  useEffect(() => {
    localStorage.setItem('roomId', roomId);
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Restore initial state
  useEffect(() => {
    if (files.length > 0) {
      const first = files[0];
      setActiveFileId(first.id);
            const initialCode = fileContents[first.id] || '';
      setCode(initialCode);
      const ext = first.name.slice(first.name.lastIndexOf('.'));
      const lang = getLanguageByExtension(ext);
      setEditorLanguage(lang);
      setEditorVersion(getDefaultVersion(lang));
    }
  }, []);

  const loadBoilerplate = (ext) => {
    switch (ext) {
      case '.py':
        return `def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`;
      case '.js':
        return `function main() {\n  console.log("Hello, World!");\n}\n\nmain();`;
      case '.java':
        return `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`;
      case '.cpp':
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`;
      default:
        return '';
    }
  };

  const getLanguageByExtension = (ext) => {
    switch (ext) {
      case '.py': return 'python';
      case '.js': return 'javascript';
      case '.java': return 'java';
      case '.cpp': return 'cpp';
      default: return 'plaintext';
    }
  };

  const getDefaultVersion = (lang) => {
    const versions = {
      python: '3.10.0',
      javascript: '18.15.0',
      java: '15.0.2',
      cpp: '10.2.0',
    };
    return versions[lang] || 'latest';
  };

  const handleDownloadAllFiles = () => {
  const zip = new JSZip();

  files.forEach((file) => {
    const content = fileContents[file.id] || '';
    zip.file(file.name, content);
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'all-files.zip');
  });
  };
  
  const allowedExtensions = ['.py', '.js', '.java', '.cpp'];

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      setError('File name cannot be empty');
      return;
    }

    let fileName = newFileName.trim();
    if (!fileName.includes('.')) {
      fileName += '.py';
    }

    const ext = fileName.slice(fileName.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      setError('Only .py, .js, .java, or .cpp files are allowed');
      return;
    }

    if (files.some(f => f.name === fileName)) {
      setError('File with this name already exists');
      return;
    }

    const newFile = { id: Date.now(), name: fileName };
    const boilerplateCode = loadBoilerplate(ext);

    setFiles(prev => [...prev, newFile]);
    setFileContents(prev => ({ ...prev, [newFile.id]: boilerplateCode }));
    setActiveFileId(newFile.id);
    const lang = getLanguageByExtension(ext);
    setEditorLanguage(lang);
    setEditorVersion(getDefaultVersion(lang));
    setCode(boilerplateCode);
    setNewFileName('');
    setIsCreatingFile(false);
    setError('');
  };

  const handleNewFileNameChange = (value) => {
    setNewFileName(value);
    setError('');
  };

  const handleDeleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setFileContents(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
    if (activeFileId === fileId) {
      setActiveFileId(null);
      setCode('');
    }
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

  const handleFileClick = (fileId) => {
    if (fileId === activeFileId) return;
    if (activeFileId !== null) {
      setFileContents(prev => ({ ...prev, [activeFileId]: code }));
    }
    setActiveFileId(fileId);
    const newCode = fileContents[fileId] || '';
    setCode(newCode);

    const fileName = files.find(f => f.id === fileId)?.name || '';
    const ext = fileName.slice(fileName.lastIndexOf('.'));
    const lang = getLanguageByExtension(ext);
    setEditorLanguage(lang);
    setEditorVersion(getDefaultVersion(lang));
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
    <div className={`app-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <Navbar
        handleRoomClick={() => setShowRoomModal(true)}
        handleProfileClick={() => setShowProfileModal(true)}
      />
      {
        <h1>{roomId}</h1>
      }
      <div className="main">
        <aside className="toolkit">
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
            roomId={roomId}
            onFileClick={handleFileClick}
            activeFileId={activeFileId}
          />
        </aside>

        <main className="workspace">
          <div className="code-editor">
            <button onClick={handleDownloadAllFiles} disabled={files.length===0} className="download-btn">
            ⬇️ Download All Files
            </button>
            <Compiler
              darkMode={isDarkTheme}
              roomId={roomId}
              code={code}
              setCode={setCode}
              setEditorLanguage={setEditorLanguage}
              setEditorVersion={setEditorVersion}
            />
            
          </div>
        </main>
      </div>
      {showRoomModal && (
        <RoomModal onClose={() => setShowRoomModal(false)} />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}

export default EditorPage;
