import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

const Chat = ({ darkMode }) => {
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false); 
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const [modalOpen, setModalOpen] = useState(true);
  const [joinExisting, setJoinExisting] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('receive-message', ({ sender, message }) => {
      setChat(prev => [...prev, { sender, message }]);
    });

    return () => {};
  }, []);

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setJoined(true);
    socketRef.current.emit('join-room', newRoomId);
    setModalOpen(false);

    localStorage.setItem('roomId', newRoomId);
    localStorage.setItem('joined', 'true');

    navigator.clipboard.writeText(newRoomId).then(() => {
      alert(`Room created and ID copied: ${newRoomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (roomId !== '' && roomId.length > 3) {
      socketRef.current.emit('join-room', roomId);
      setJoined(true);
      setModalOpen(false);

      localStorage.setItem('roomId', roomId);
      localStorage.setItem('joined', 'true');
    } else {
      alert('Enter a valid Room ID');
    }
  };

  const sendMessage = () => {
    if (message !== '') {
      socketRef.current.emit('send-message', { roomId, message });
      setChat(prev => [...prev, { sender: 'You', message }]);
      setMessage('');
    }
  };

  const leaveRoom = () => {
    socketRef.current.emit('leave-room', roomId);
    setJoined(false);
    setChat([]);
    setRoomId('');
    setModalOpen(true);
    setJoinExisting(false);
    localStorage.removeItem('joined');
    localStorage.removeItem('roomId');
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Join Room</h2>

              {!joinExisting ? (
                <>
                  <p>Would you like to create a new room or join an existing one?</p>
                  <button onClick={handleCreateRoom}>Create Room</button>
                  <button onClick={() => setJoinExisting(true)}>Join Room</button>
                  <button onClick={() => setModalOpen(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
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
            <h2>Room: {roomId}</h2>
            <div className="chat-box">
              {chat.map((msg, i) => (
                <div key={i}>
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
              />
              <div className="button-space">
                <button onClick={sendMessage} className="send-button">Send</button>
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
