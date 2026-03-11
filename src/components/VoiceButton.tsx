import React, { useState } from 'react';
import { VoiceService } from '../services/voiceService';
import { VoiceRecognitionResult } from '../types';

interface VoiceButtonProps {
  onVoiceResult: (result: VoiceRecognitionResult) => void;
  onError: (error: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onVoiceResult,
  onError,
  isListening,
  setIsListening
}) => {
  const [voiceService] = useState(() => new VoiceService());

  const handleVoiceInput = async () => {
    if (!voiceService.isSupported()) {
      onError('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    try {
      setIsListening(true);
      const result = await voiceService.startListening();
      onVoiceResult(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Voice recognition failed');
    } finally {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  return (
    <button
      onClick={isListening ? stopListening : handleVoiceInput}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: isListening ? '#ef4444' : '#3b82f6',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isListening ? (
        <div style={{ 
          width: '20px', 
          height: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          <div style={{
            width: '12px',
            height: '8px',
            backgroundColor: 'white',
            borderRadius: '50% 50% 0 0',
            marginBottom: '2px'
          }}></div>
          <div style={{
            width: '4px',
            height: '6px',
            backgroundColor: 'white'
          }}></div>
        </div>
      ) : (
        <div style={{ 
          width: '20px', 
          height: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '8px',
            backgroundColor: 'white',
            borderRadius: '50% 50% 0 0',
            marginBottom: '2px'
          }}></div>
          <div style={{
            width: '4px',
            height: '6px',
            backgroundColor: 'white'
          }}></div>
        </div>
      )}
    </button>
  );
};

export default VoiceButton;
