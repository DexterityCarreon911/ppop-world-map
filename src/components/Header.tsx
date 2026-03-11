import React from 'react';

const Header: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 999,
        textAlign: 'center'
      }}
    >
      <h1
        style={{
          margin: '0',
          color: '#1f2937',
          fontSize: '20px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        AI Voice-Controlled Map of America
      </h1>
      <p
        style={{
          margin: '6px 0 0 0',
          color: '#6b7280',
          fontSize: '14px'
        }}
      >
        Click the microphone button and ask about any location in the United States
      </p>
    </div>
  );
};

export default Header;
