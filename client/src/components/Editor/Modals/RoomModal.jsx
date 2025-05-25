import React, { useState } from 'react';

const RoomModal = ({ onClose, onCreateRoom, onJoinRoom }) => {
  const [roomMode, setRoomMode] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  const handleBackFromRoom = () => {
    if (roomMode === null) {
      onClose();
    } else {
      setRoomMode(null);
    }
  };

  return (
    <div className="room-modal-overlay">
      <div className="room-modal-content">
        <button className="modal-back-btn" onClick={handleBackFromRoom}>
          <span className="back-icon">←</span>
          Back
        </button>
        
        {roomMode === null ? (
          <div className="room-options">
            <h2>Welcome to Code Crux</h2>
            <p className="room-options-subtitle">
              Choose how you want to collaborate
            </p>
            
            <div className="room-options-grid">
              <div 
                className="room-option-card"
                onClick={() => setRoomMode('create')}
              >
                <span className="room-option-icon">🏗️</span>
                <h3 className="room-option-title">Create Room</h3>
                <p className="room-option-description">
                  Start a new collaboration room and invite others to join. You'll be the admin of the room.
                </p>
              </div>

              <div 
                className="room-option-card"
                onClick={() => setRoomMode('join')}
              >
                <span className="room-option-icon">🚪</span>
                <h3 className="room-option-title">Join Room</h3>
                <p className="room-option-description">
                  Join an existing room using a room ID and password provided by the room admin.
                </p>
              </div>
            </div>
          </div>
        ) : roomMode === 'create' ? (
          <div className="room-form">
            <h2>Create New Room</h2>
            <div className="room-input-group">
              <label className="room-input-label">Room Password</label>
              <div className="room-input-wrapper">
                <span className="room-input-icon">🔒</span>
                <input
                  type="password"
                  className="room-input"
                  placeholder="Enter room password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="room-button-group">
              <button 
                className="room-submit-btn"
                onClick={() => onCreateRoom(roomPassword)}
              >
                <span>OK</span>
              </button>
              <button 
                className="room-cancel-btn"
                onClick={() => setRoomMode(null)}
              >
                <span>Back</span>
              </button>
            </div>
          </div>
        ) : roomMode === 'join' ? (
          <div className="room-form">
            <h2>Join Room</h2>
            <div className="room-input-group">
              <label className="room-input-label">Room ID</label>
              <div className="room-input-wrapper">
                <span className="room-input-icon">🔑</span>
                <input
                  type="text"
                  className="room-input"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
              </div>
            </div>
            <div className="room-input-group">
              <label className="room-input-label">Room Password</label>
              <div className="room-input-wrapper">
                <span className="room-input-icon">🔒</span>
                <input
                  type="password"
                  className="room-input"
                  placeholder="Enter room password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="room-button-group">
              <button 
                className="room-submit-btn"
                onClick={() => onJoinRoom(roomId, roomPassword)}
              >
                <span>Join</span>
              </button>
              <button 
                className="room-cancel-btn"
                onClick={() => setRoomMode(null)}
              >
                <span>Back</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RoomModal; 