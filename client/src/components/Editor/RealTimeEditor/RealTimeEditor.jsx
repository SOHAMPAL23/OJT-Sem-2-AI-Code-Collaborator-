import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import MonacoEditor from '@monaco-editor/react';
import io from 'socket.io-client';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const SOCKET_URL = 'http://localhost:3001';

const INITIAL_CODE = {
  javascript: `// JavaScript Hello World
console.log("Hello, World!");`,
  python: `# Python Hello World
print("Hello, World!")`,
  java: `// Java Hello World
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `// C++ Hello World
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  typescript: `// TypeScript Hello World
const greeting: string = "Hello, World!";
console.log(greeting);`,
  ruby: `# Ruby Hello World
puts "Hello, World!"`
};

const RealTimeEditor = ({ roomId, userName, darkMode }) => {
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState(INITIAL_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!userName || !roomId) return;

    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    // Handle window unload
    const handleBeforeUnload = () => {
      socketInstance.emit('leaveRoom');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, userName]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join', { roomId, userName });

    // Handle code updates
    socket.on('codeUpdate', (newCode) => {
      setCode(newCode);
    });

    // Handle user updates
    socket.on('roomInfo', ({ users: userList, activity }) => {
      setUsers(userList);
    });

    // Handle user notifications
    socket.on('userNotification', ({ type, user }) => {
      if (type === 'join') {
        toast.info(`${user} joined the room`);
      } else if (type === 'leave') {
        toast.info(`${user} left the room`);
      }
    });

    // Handle typing indicators
    socket.on('userTyping', (user) => {
      setTypingUser(user);
      setTimeout(() => {
        setTypingUser((currentTypingUser) => 
          currentTypingUser === user ? '' : currentTypingUser
        );
      }, 1500);
    });

    // Handle language updates
    socket.on('languageUpdate', (newLanguage) => {
      setLanguage(newLanguage);
      setCode(INITIAL_CODE[newLanguage]);
    });

    // Handle code execution response
    socket.on('codeResponse', (response) => {
      const output = response.run.output || response.run.stderr || 'No output';
      setOutput(output);
      setIsExecuting(false);
      
      if (response.executedBy && response.executedBy !== userName) {
        toast.info(`Code executed by ${response.executedBy}`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      toast.error(error.message);
      setIsExecuting(false);
    });

    return () => {
      socket.emit('leaveRoom');
      socket.off('codeUpdate');
      socket.off('roomInfo');
      socket.off('userNotification');
      socket.off('userTyping');
      socket.off('languageUpdate');
      socket.off('codeResponse');
      socket.off('error');
    };
  }, [socket, roomId, userName]);

  // Code change handler with debouncing
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (socket) {
      socket.emit('codeChange', { roomId, code: newCode });
      socket.emit('typing', { roomId, userName });
    }
  }, [socket, roomId, userName]);

  // Language change handler
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    const newCode = INITIAL_CODE[newLanguage];
    setCode(newCode);
    if (socket) {
      socket.emit('languageChange', { roomId, language: newLanguage });
      socket.emit('codeChange', { roomId, code: newCode });
    }
  };

  // Run code
  const runCode = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setOutput('Executing...');
    if (socket) {
      socket.emit('compileCode', { code, roomId, language });
    }
  };

  // Download code with ZIP
  const downloadCode = async () => {
    try {
      const zip = new JSZip();
      
      const fileExtensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        typescript: 'ts',
        ruby: 'rb'
      };
      
      const fileName = `code.${fileExtensions[language]}`;
      zip.file(fileName, code);
      
      const readmeContent = `# Code Export
Language: ${language}
Created: ${new Date().toLocaleString()}
Room ID: ${roomId}
Users in Room: ${users.join(', ')}

This code was exported from the AI Code Collaborator.`;
      
      zip.file('README.md', readmeContent);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `code-export-${language}-${Date.now()}.zip`);
      toast.success('Code downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download code');
      console.error('Download error:', error);
    }
  };

  return (
    <div className="realtime-editor">
      <div className="editor-header">
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="typescript">TypeScript</option>
          <option value="ruby">Ruby</option>
        </select>

        <div className="connected-users">
          <span>Connected Users ({users.length}): </span>
          {users.map((user, index) => (
            <span key={user} className={user === userName ? 'current-user' : ''}>
              {user}{index < users.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>

        <div className="actions">
          <button 
            className="run-btn" 
            onClick={runCode}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : 'Run Code'}
          </button>
          <button className="download-btn" onClick={downloadCode}>
            Download
          </button>
        </div>
      </div>

      {typingUser && typingUser !== userName && (
        <div className="typing-indicator">
          {typingUser} is typing...
        </div>
      )}

      <div className="editor-main">
        <MonacoEditor
          height="60vh"
          language={language}
          theme={darkMode ? "vs-dark" : "light"}
          value={code}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="editor-footer">
        <textarea
          className="output-console"
          value={output}
          readOnly
          placeholder="Output will appear here..."
        />
      </div>
    </div>
  );
};

export default RealTimeEditor; 