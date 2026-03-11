import React from 'react';
import { Location } from '../types';

interface InfoPanelProps {
  location: Location | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ location, onClose }) => {
  if (!location) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '350px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        border: '1px solid #e5e7eb'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h2
          style={{
            margin: '0 0 12px 0',
            color: '#1f2937',
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          {location.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ✕
        </button>
      </div>
      
      <div
        style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#4b5563'
        }}
      >
        <strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
      </div>
      
      <p
        style={{
          margin: '0',
          color: '#374151',
          lineHeight: '1.6',
          fontSize: '15px'
        }}
      >
        {location.description}
      </p>
      
      {location.imageUrl && (
        <img
          src={location.imageUrl}
          alt={location.name}
          style={{
            width: '100%',
            borderRadius: '8px',
            marginTop: '16px',
            height: '200px',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  );
};

export default InfoPanel;
