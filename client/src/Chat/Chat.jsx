import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:5000');

const Chat=({darkMode})=> {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  const change = () => {
    setJoined(false);
    setChat([]);
    setRoomId('');
  };

  const joinRoom = () => {
    if (roomId !== '') {
      socket.emit('join-room', roomId);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message !== '') {
      socket.emit('send-message', { roomId, message });
      setChat(prev => [...prev, { sender: 'You', message }]);
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive-message', ({ sender, message }) => {
      setChat(prev => [...prev, { sender, message }]);
    });
    return () => socket.off();
  }, []);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="top-bar">
       
      </div>

      <div className="container">
        {!joined ? (
          <div className="join-room">
          <h2>Join Chat Room</h2>
          <input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
          <button className="back-btn" onClick={change}>Back</button>
        </div>
        
        ) : (
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
              <button onClick={sendMessage}>Send</button>
              <button className="back-btn" onClick={change}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
