import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import MonacoEditor from '@monaco-editor/react';
import io from 'socket.io-client';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios';
import './RealTimeEditor.css'; // Assuming you have a CSS file for styling

// Define your socket and compiler API URLs
const SOCKET_URL = 'http://localhost:5001';
const COMPILER_API = 'http://localhost:5001/api/compile/compile';

// Initial code snippets for various languages
const INITIAL_CODE = {
  javascript: `// JavaScript Hello World
console.log("Hello, World!");

// Example function
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("User"));`,

  python: `# Python Hello World
print("Hello, World!")

# Example function
def greet(name):
    return f"Hello, {name}!"

print(greet("User"))`,

  java: `// Java Hello World
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example method
        String greeting = greet("User");
        System.out.println(greeting);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

  cpp: `// C++ Hello World
#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    // Example function usage
    std::cout << greet("User") << std::endl;
    
    return 0;
}`,

  typescript: `// TypeScript Hello World
const greeting: string = "Hello, World!";
console.log(greeting);

// Example function with types
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

console.log(greet("User"));`,

  ruby: `# Ruby Hello World
puts "Hello, World!"

# Example method
def greet(name)
    "Hello, #{name}!"
end

puts greet("User")`
};

// Language version mapping for the compiler API
const LANGUAGE_VERSIONS = {
  javascript: '18.15.0', // Example: Use a specific Node.js version
  python: '3.10.0',     // Example: Use a specific Python 3 version
  java: '15.0.2',       // Example: Use a specific Java version
  cpp: '10.2.0',        // Example: Use a specific C++ GCC version
  typescript: '4.9.5',  // Example: Use a specific TypeScript version
  ruby: '3.0.0'         // Example: Use a specific Ruby version
};

// Helper to generate a simple room ID
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

const RealTimeEditor = ({ darkMode }) => { // Removed roomId, userName props as it's now internal
  // Editor-specific states
  const [code, setCode] = useState(INITIAL_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [stdin, setStdin] = useState('');
  const [users, setUsers] = useState([]); // Users in the editor/chat room
  const [typingUser, setTypingUser] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [compilationMethod, setCompilationMethod] = useState('api');
  const [lastSaved, setLastSaved] = useState(new Date());

  // Chat-specific states
  const [roomId, setRoomId] = useState(''); // Room ID for both editor and chat
  const [userName, setUserName] = useState(''); // User name for both editor and chat
  const [joined, setJoined] = useState(false); // Indicates if user has joined a room
  const [chatMessage, setChatMessage] = useState(''); // Current chat input
  const [chatHistory, setChatHistory] = useState([]); // Array of chat messages

  // Modal states for joining/creating room
  const [modalOpen, setModalOpen] = useState(true);
  const [joinExisting, setJoinExisting] = useState(false);

  // Socket.IO ref
  const socketRef = useRef(null);
  // Ref for the chat box to enable auto-scrolling
  const chatBoxRef = useRef(null);

  // Main useEffect for Socket.IO connection and listeners
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Frontend: Connected to Socket.IO server!', socketRef.current.id);
      setIsConnected(true);
      toast.success('Connected to the server!');

      // If already joined (e.g., from localStorage), re-emit join events
      const storedRoomId = localStorage.getItem('editorRoomId');
      const storedUserName = localStorage.getItem('editorUserName');
      const storedJoined = localStorage.getItem('editorJoined') === 'true';

      if (storedJoined && storedRoomId && storedUserName) {
        setRoomId(storedRoomId);
        setUserName(storedUserName);
        setJoined(true);
        setModalOpen(false); // Close modal if already joined
        console.log('Frontend: Re-joining room from localStorage:', { storedRoomId, storedUserName });
        socketRef.current.emit('join', { roomId: storedRoomId, userName: storedUserName }); // Editor join
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Frontend: Disconnected from Socket.IO server.');
      setIsConnected(false);
      toast.error('Disconnected from the server. Attempting to reconnect...');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Frontend: Socket.IO connection error:', error);
      setIsConnected(false);
      toast.error(`Connection error: ${error.message}`);
    });

    // Editor-specific listeners
    socketRef.current.on('userNotification', ({ type, user }) => {
      console.log(`Frontend: Received userNotification - Type: ${type}, User: ${user}`);
      if (type === 'join') {
        toast.info(`${user} joined the editor.`);
      } else if (type === 'leave') {
        toast.warn(`${user} left the editor.`);
      }
    });

    socketRef.current.on('roomInfo', ({ users, activity }) => {
      console.log('Frontend: Received roomInfo:', { users, activity });
      setUsers(users); // Update the list of users in the room
    });

    socketRef.current.on('codeUpdate', (newCode) => {
      console.log('Frontend: Received codeUpdate.');
      setCode(newCode);
    });

    socketRef.current.on('languageUpdate', (newLanguage) => {
      console.log('Frontend: Received languageUpdate:', newLanguage);
      setLanguage(newLanguage);
      setCode(INITIAL_CODE[newLanguage] || '');
      toast.info(`Language changed to ${newLanguage}`);
    });

    socketRef.current.on('userTyping', (userName) => {
      console.log('Frontend: Received userTyping:', userName);
      setTypingUser(userName);
      const timer = setTimeout(() => setTypingUser(''), 1500);
      return () => clearTimeout(timer);
    });

    socketRef.current.on('codeResponse', (response) => {
      console.log('Frontend: Received codeResponse:', response);
      setIsExecuting(false);
      if (response.run && response.run.output) {
        setOutput(response.run.output);
        toast.success('Code executed successfully!');
      } else if (response.run && response.run.stderr) {
        setOutput(`Error:\n${response.run.stderr}`);
        toast.error('Code execution failed!');
      } else if (response.compile && response.compile.stderr) {
        setOutput(`Compilation Error:\n${response.compile.stderr}`);
        toast.error('Compilation failed!');
      } else {
        setOutput('No output or error received.');
        toast.info('Compilation successful, but no direct output from run.');
      }
    });

    socketRef.current.on('error', (data) => {
      console.error('Frontend: Received server error:', data.message);
      setIsExecuting(false);
      setOutput(`Error: ${data.message}`);
      toast.error(`Error: ${data.message}`);
    });

    // Chat-specific listeners - FIXED
    socketRef.current.on('receive-chat-message', (msg) => {
      console.log('Frontend: Received chat message:', msg);
      setChatHistory(prev => {
        // Only add if it's not already in the history (prevent duplicates)
        const exists = prev.some(existingMsg => 
          existingMsg.id === msg.id || 
          (existingMsg.sender === msg.sender && 
           existingMsg.message === msg.message && 
           Math.abs(existingMsg.timestamp - msg.timestamp) < 1000)
        );
        
        if (exists) {
          console.log('Frontend: Duplicate message detected, skipping:', msg);
          return prev;
        }
        
        const newHistory = [...prev, msg];
        console.log('Frontend: Updated chatHistory with new message:', newHistory);
        return newHistory;
      });
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Frontend: Socket disconnected on component unmount.');
      }
    };
  }, []); // Empty dependency array, runs once on mount

  // useEffect to scroll to bottom of chat box when chatHistory updates
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handlers for room creation/joining (from Chat.jsx)
  const handleCreateRoom = () => {
    if (!userName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setJoined(true);
    setModalOpen(false);
    toast.success(`Room created and ID copied: ${newRoomId}`);

    // Emit join event (unified for editor and chat)
    socketRef.current.emit('join', { roomId: newRoomId, userName });

    localStorage.setItem('editorRoomId', newRoomId);
    localStorage.setItem('editorUserName', userName);
    localStorage.setItem('editorJoined', 'true');

    navigator.clipboard.writeText(newRoomId).then(() => {
      toast.info(`Room ID copied to clipboard: ${newRoomId}`);
    }).catch(err => {
      console.error('Failed to copy room ID:', err);
      toast.error('Failed to copy room ID to clipboard.');
    });
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (roomId.trim() !== '' && roomId.length > 3) {
      setJoined(true);
      setModalOpen(false);
      toast.success(`Joined room: ${roomId}`);

      // Emit join event (unified for editor and chat)
      socketRef.current.emit('join', { roomId, userName });

      localStorage.setItem('editorRoomId', roomId);
      localStorage.setItem('editorUserName', userName);
      localStorage.setItem('editorJoined', 'true');
    } else {
      toast.error('Enter a valid Room ID (at least 4 characters).');
    }
  };

  // Handlers for editor functionality
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socketRef.current && joined) { // Only emit if joined a room
      socketRef.current.emit('codeChange', { roomId, code: newCode });
      socketRef.current.emit('typing', { roomId, userName });
    }
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setCode(INITIAL_CODE[newLanguage] || '');
    if (socketRef.current && joined) { // Only emit if joined a room
      socketRef.current.emit('languageChange', { roomId, language: newLanguage });
    }
  };

  const executeCode = async () => {
    if (!code) {
      toast.warn('Please write some code to execute.');
      return;
    }
    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Not connected to the server. Please check your connection.');
      return;
    }
    if (!joined) {
      toast.warn('Please join a room first to execute code.');
      return;
    }

    setIsExecuting(true);
    setOutput('Executing code...');

    if (compilationMethod === 'socket') {
      socketRef.current.emit('compileCode', { code, roomId, language });
    } else {
      try {
        const response = await axios.post(COMPILER_API, {
          language: language,
          version: LANGUAGE_VERSIONS[language],
          code: code,
          stdin: stdin
        });
        setIsExecuting(false);
        if (response.data.run && response.data.run.output) {
          setOutput(response.data.run.output);
          toast.success('Code executed successfully!');
        } else if (response.data.run && response.data.run.stderr) {
          setOutput(`Error:\n${response.data.run.stderr}`);
          toast.error('Code execution failed!');
        } else if (response.data.compile && response.data.compile.stderr) {
           setOutput(`Compilation Error:\n${response.data.compile.stderr}`);
           toast.error('Compilation failed!');
        }
        else {
          setOutput('No output or error received.');
          toast.info('API call successful, but no run output.');
        }
      } catch (error) {
        setIsExecuting(false);
        console.error('API compilation error:', error);
        setOutput(`API Error: ${error.response?.data?.details || error.response?.data?.error || error.message}`);
        toast.error(`API compilation failed: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  const downloadCode = () => {
    const zip = new JSZip();
    const filename = `main.${language}`;
    zip.file(filename, code);

    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, `code_room_${roomId}.zip`);
        toast.success('Code downloaded successfully!');
      })
      .catch((error) => {
        console.error('Error zipping and downloading code:', error);
        toast.error('Failed to download code.');
      });
  };

  // Handlers for chat functionality - FIXED
  const sendChatMessage = () => {
    if (chatMessage.trim() !== '' && userName.trim() !== '' && joined) {
      // Generate a unique ID for the message
      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();
      
      const messageToSend = { 
        roomId, 
        sender: userName, 
        message: chatMessage.trim(), 
        id: messageId,
        timestamp: timestamp
      };
      
      console.log('Frontend: Emitting send-chat-message:', messageToSend);
      
      try {
        socketRef.current.emit('send-chat-message', messageToSend);
        console.log("Frontend: Message emitted successfully");
      } catch(e) {
        console.error("Frontend: Error emitting chat message:", e);
        toast.error('Failed to send message');
      }
      
      setChatMessage(''); // Clear input
    } else {
      toast.warn('Message, username, or room cannot be empty.');
    }
  };

  const leaveRoom = () => {
    if (socketRef.current && joined) {
      console.log('Frontend: Emitting leaveRoom:', { roomId, userName });
      socketRef.current.emit('leaveRoom', { roomId, userName }); // Emit a unified leave event
    }
    setJoined(false);
    setRoomId('');
    setUserName('');
    setCode(INITIAL_CODE.javascript); // Reset code
    setLanguage('javascript'); // Reset language
    setOutput(''); // Clear output
    setStdin(''); // Clear stdin
    setUsers([]); // Clear user list
    setChatHistory([]); // Clear chat history
    setModalOpen(true); // Re-open modal
    setJoinExisting(false); // Reset join type

    localStorage.removeItem('editorJoined');
    localStorage.removeItem('editorRoomId');
    localStorage.removeItem('editorUserName');
    toast.info('You have left the room.');
  };

  // Rendered Component UI
  return (
    <div className="real-time-editor-container">
      {/* Room Join/Create Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Join Collaborative Room</h2>
            {!userName && (
              <input
                type="text"
                placeholder="Enter Your Name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="username-input"
              />
            )}

            {userName && !joinExisting ? (
              <>
                <p>Would you like to create a new room or join an existing one?</p>
                <button onClick={handleCreateRoom}>Create Room</button>
                <button onClick={() => setJoinExisting(true)}>Join Existing Room</button>
              </>
            ) : userName && (
              <>
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  className="roomid-input"
                />
                <div className="modal-buttons">
                  <button onClick={handleJoinRoom}>Join</button>
                  <button onClick={() => setJoinExisting(false)}>Back</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Editor and Chat UI (only shown if joined) */}
      {joined && (
        <div className="main-content">
          <div className="editor-section">
            {/* Connection Status Indicator */}
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢' : '🔴'}
              </span>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              {typingUser && <span className="typing-indicator">{typingUser} is typing...</span>}
            </div>

            {/* Top Bar: Language Selector, Execute, Download */}
            <div className="editor-controls">
              <select value={language} onChange={handleLanguageChange}>
                {Object.keys(INITIAL_CODE).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <button onClick={executeCode} disabled={isExecuting}>
                {isExecuting ? 'Executing...' : 'Run Code'}
              </button>
              <button onClick={downloadCode}>Download Code</button>
              <label>
                <input
                  type="checkbox"
                  checked={compilationMethod === 'api'}
                  onChange={() => setCompilationMethod(compilationMethod === 'api' ? 'socket' : 'api')}
                />
                Use Compiler API
              </label>
              <span className="last-saved">Last Saved: {lastSaved.toLocaleTimeString()}</span>
              <button className="leave-room-btn" onClick={leaveRoom}>Leave Room</button>
            </div>

            {/* Monaco Editor Component */}
            <div className="monaco-editor-wrapper" style={{ height: '500px', width: '100%' }}>
              <MonacoEditor
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme={darkMode ? 'vs-dark' : 'vs-light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Input/Output Panels */}
            <div className="io-panels">
              <div className="input-panel">
                <h3>Input (stdin)</h3>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input for your program here..."
                ></textarea>
              </div>
              <div className="output-panel">
                <h3>Output</h3>
                <pre>{output}</pre>
              </div>
            </div>

            {/* Users in Room Display */}
            <div className="users-in-room">
              <h3>Users in Room ({roomId}):</h3>
              <ul>
                {users.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <h2>Chat - Room: {roomId}</h2>
            <div className="chat-box" ref={chatBoxRef} style={{ 
              border: '2px solid red', 
              backgroundColor: 'lightblue',
              height: '300px',
              overflowY: 'auto',
              padding: '10px'
            }}>
              {chatHistory.length === 0 ? (
                <div style={{ color: 'gray', textAlign: 'center', marginTop: '20px' }}>
                  No messages yet. Start chatting!
                </div>
              ) : (
                chatHistory.map((msg) => (
                  <div 
                    key={msg.id} // This is crucial for React to track messages
                    className={msg.sender === userName ? 'my-message' : 'other-message'}
                    style={{ 
                      backgroundColor: msg.sender === userName ? 'lime' : 'cyan', 
                      color: 'black', 
                      fontSize: '14px',
                      padding: '8px',
                      margin: '5px 0',
                      border: '1px solid green',
                      borderRadius: '5px',
                      display: 'block',
                      wordBreak: 'break-word'
                    }}
                  >
                    <strong>{msg.sender || 'Unknown'}:</strong> {msg.message || 'Empty Message'}
                    {msg.timestamp && (
                      <span style={{ fontSize: '10px', color: 'gray', marginLeft: '10px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="chat-controls" style={{ marginTop: '10px' }}>
              <input
                placeholder="Type message"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                disabled={!joined}
                style={{ width: '70%', padding: '8px' }}
              />
              <button 
                onClick={sendChatMessage} 
                className="send-button" 
                disabled={!joined}
                style={{ width: '25%', padding: '8px', marginLeft: '5%' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeEditor;