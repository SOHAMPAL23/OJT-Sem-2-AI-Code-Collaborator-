import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify'; // Assuming you have toast installed
import './Chat.css';

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

const Chat = ({ darkMode, onRoomJoined }) => { // Added onRoomJoined prop
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState(''); // New state for user name
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const [modalOpen, setModalOpen] = useState(true);
  const [joinExisting, setJoinExisting] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:5001');

    // Listener for receiving chat messages
    socketRef.current.on('receive-chat-message', ({ sender, message }) => {
      setChat(prev => [...prev, { sender, message }]);
    });

    // Listener for user join/leave notifications (optional, if you want chat to show these)
    socketRef.current.on('userNotification', ({ type, user }) => {
      if (type === 'join') {
        toast.info(`${user} joined the room.`);
      } else if (type === 'leave') {
        toast.warn(`${user} left the room.`);
      }
    });

    // Clean up socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Chat: Socket disconnected on cleanup.');
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name.');
      return;
    }
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setJoined(true);
    // Emit specific chat room join event
    socketRef.current.emit('join-chat-room', { roomId: newRoomId, userName });
    setModalOpen(false);
    toast.success(`Room created and ID copied: ${newRoomId}`);

    localStorage.setItem('chatRoomId', newRoomId); // Use specific key for chat
    localStorage.setItem('chatUserName', userName); // Store user name
    localStorage.setItem('chatJoined', 'true');

    // Pass room ID and user name to parent component
    if (onRoomJoined) {
      onRoomJoined(newRoomId, userName);
    }

    navigator.clipboard.writeText(newRoomId).then(() => {
      alert(`Room created and ID copied to clipboard: ${newRoomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (roomId !== '' && roomId.length > 3) {
      // Emit specific chat room join event
      socketRef.current.emit('join-chat-room', { roomId, userName });
      setJoined(true);
      setModalOpen(false);
      toast.success(`Joined room: ${roomId}`);

      localStorage.setItem('chatRoomId', roomId);
      localStorage.setItem('chatUserName', userName);
      localStorage.setItem('chatJoined', 'true');

      // Pass room ID and user name to parent component
      if (onRoomJoined) {
        onRoomJoined(roomId, userName);
      }

    } else {
      alert('Enter a valid Room ID');
    }
  };

  const sendMessage = () => {
    if (message.trim() !== '' && userName.trim() !== '') {
      // Emit specific chat message event
      socketRef.current.emit('send-chat-message', { roomId, sender: userName, message });
      setChat(prev => [...prev, { sender: 'You', message }]); // Immediately show own message
      setMessage('');
    } else {
      toast.warn('Message or username cannot be empty.');
    }
  };

  const leaveRoom = () => {
    // Emit specific chat room leave event
    socketRef.current.emit('leave-chat-room', { roomId, userName });
    setJoined(false);
    setChat([]);
    setRoomId('');
    setUserName(''); // Clear user name as well
    setModalOpen(true);
    setJoinExisting(false);
    localStorage.removeItem('chatJoined');
    localStorage.removeItem('chatRoomId');
    localStorage.removeItem('chatUserName');
    toast.info('You have left the room.');
  };

  // Check localStorage for previous session's room ID and user name on mount
  useEffect(() => {
    const storedRoomId = localStorage.getItem('chatRoomId');
    const storedUserName = localStorage.getItem('chatUserName');
    const storedJoined = localStorage.getItem('chatJoined') === 'true';

    if (storedJoined && storedRoomId && storedUserName) {
      setRoomId(storedRoomId);
      setUserName(storedUserName);
      setJoined(true);
      setModalOpen(false);
      // Re-emit join event to re-sync with server after refresh if already joined
      if (socketRef.current && socketRef.current.connected) {
         socketRef.current.emit('join-chat-room', { roomId: storedRoomId, userName: storedUserName });
         if (onRoomJoined) {
           onRoomJoined(storedRoomId, storedUserName);
         }
      } else {
        // If socket not connected yet, wait for connect event
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-chat-room', { roomId: storedRoomId, userName: storedUserName });
            if (onRoomJoined) {
              onRoomJoined(storedRoomId, storedUserName);
            }
        });
      }
    }
  }, []);


  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Join Chat Room</h2>
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
                  {/* You might not want a cancel button if it's the only way to get a room */}
                  {/* <button onClick={() => setModalOpen(false)}>Cancel</button> */}
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

        {joined && (
          <div className="chat-room">
            <h2>Room: {roomId} - User: {userName}</h2>
            <div className="chat-box">
              {chat.map((msg, i) => (
                <div key={i} className={msg.sender === 'You' ? 'my-message' : 'other-message'}>
                  <strong>{msg.sender}:</strong> {msg.message}
                </div>
              ))}
            </div>

            <div className="chat-controls">
              <input
                placeholder="Type message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                disabled={!joined} // Disable input if not joined
              />
              <div className="button-space">
                <button onClick={sendMessage} className="send-button" disabled={!joined}>Send</button>
                <button className="back-btn" onClick={leaveRoom}>Leave Room</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
