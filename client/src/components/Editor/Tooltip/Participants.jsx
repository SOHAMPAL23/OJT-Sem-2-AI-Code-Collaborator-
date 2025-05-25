import React, { useState, useEffect } from 'react';

const Participants = ({ onBack, currentUser, participants, onRoleChange }) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState({});

  const handleDotsClick = (participantId) => {
    setShowRoleDropdown(prev => ({ ...prev, [participantId]: !prev[participantId] }));
  };

  const handleRoleSelect = (participantId, newRole) => {
    onRoleChange(participantId, newRole);
    setShowRoleDropdown(prev => ({ ...prev, [participantId]: false }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.participant-item')) {
        setShowRoleDropdown({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="participants-panel">
      <div className="panel-header">
        <button className="back-btn" onClick={onBack}>
          <span>←</span> Back
        </button>
        <h3>Participants</h3>
      </div>
      
      <div className="participants-list">
        {[currentUser, ...participants.filter(p => p.id !== currentUser.id)].map(participant => (
          <div key={participant.id} className={`participant-item${participant.id === currentUser.id ? ' current-user' : ''}`}> 
            <div className="participant-info">
              <span className="participant-name">{participant.name}</span>
            </div>
            <div className="participant-actions">
              <button
                className="dots-btn"
                onClick={() => handleDotsClick(participant.id)}
                tabIndex={0}
                aria-label="Change role"
              >
                &#8942;
              </button>
              {showRoleDropdown[participant.id] && (
                <div className="role-dropdown">
                  <div
                    className="role-option"
                    onClick={() => handleRoleSelect(participant.id, 'admin')}
                  >Admin</div>
                  <div
                    className="role-option"
                    onClick={() => handleRoleSelect(participant.id, 'editor')}
                  >Editor</div>
                  <div
                    className="role-option"
                    onClick={() => handleRoleSelect(participant.id, 'viewer')}
                  >Viewer</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Participants; 