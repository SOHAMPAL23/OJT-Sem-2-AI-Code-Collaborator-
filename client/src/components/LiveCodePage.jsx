import React, { useState } from 'react';
import Chat from './Chat';
import Compiler from './Compiler';

const LiveCodePage = ({ darkMode, roomId, setRoomId }) => {
  return (
    <div>
      <Chat darkMode={darkMode} roomId={roomId} setRoomId={setRoomId} />
      {roomId && <Compiler darkMode={darkMode} roomId={roomId} />}
    </div>
  );
};

export default LiveCodePage;
