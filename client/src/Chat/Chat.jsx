import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const Chat = ({ darkMode, roomId, setRoomId }) => {
  const socketRef = useRef();
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('receive-message', ({ sender, message }) => {
      setChat(prev => [...prev, { sender, message }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (roomId && roomId.length > 3) {
      socketRef.current.emit('join-room', roomId);
      setJoined(true);
    } else {
      alert('Enter valid room id');
    }
  };

  const sendMessage = () => {
    if (message !== '') {
      socketRef.current.emit('send-message', { roomId, message });
      setChat(prev => [...prev, { sender: 'You', message }]);
      setMessage('');
    }
  };

  const change = () => {
    setJoined(false);
    setChat([]);
    setRoomId('');
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
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
              <div className='button-space'>
                <button onClick={sendMessage} className='send-button'>Send</button>
                <button className="back-btn" onClick={change}>Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
