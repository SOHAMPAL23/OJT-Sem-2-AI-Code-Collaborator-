import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import './EditorPage.css';

const EditorPage = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(16);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { isDarkTheme } = useTheme();

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      const urlParams = new URLSearchParams(window.location.search);
      const room = urlParams.get('room');
      if (room) {
        setRoomId(room);
        newSocket.emit('join-room', room);
      }
    });

    newSocket.on('receive-changes', (delta) => {
      setCode(delta);
    });

    newSocket.on('user-joined', (users) => {
      setUsers(users);
    });

    newSocket.on('user-left', (users) => {
      setUsers(users);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
    socket?.emit('send-changes', value, roomId);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const handleFontSizeChange = (event) => {
    setFontSize(parseInt(event.target.value));
  };

  const handleRun = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/code/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error running code');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/code/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = await response.json();
      console.log('Code saved:', data);
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  const handleShare = () => {
    const roomId = Math.random().toString(36).substring(7);
    socket?.emit('create-room', roomId);
    setRoomId(roomId);
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share URL copied to clipboard!');
  };

  return (
    <div className={`app ${isDarkTheme ? 'dark' : 'light'}`}>
      <div className="toolbar">
        <select value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <select value={theme} onChange={handleThemeChange}>
          <option value="vs-dark">Dark</option>
          <option value="light">Light</option>
        </select>
        <select value={fontSize} onChange={handleFontSizeChange}>
          {[12, 14, 16, 18, 20, 22, 24].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button onClick={handleRun}>Run</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleShare}>Share</button>
        <button onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>

      <div className="main-content">
        <div className="editor-container">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            theme={theme}
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: fontSize,
              minimap: { enabled: false },
            }}
          />
        </div>

        <div className="output-container">
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>
      </div>

      {users.length > 0 && (
        <div className="users-list">
          <h4>Connected Users:</h4>
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EditorPage; 