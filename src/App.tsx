import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import VoiceButton from './components/VoiceButton';
import Header from './components/Header';
import { GeneralAIService } from './services/generalAIService';
import { Location, VoiceRecognitionResult } from './types';
import './App.css';

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: 'red' }}>{this.state.error?.message}</p>
          <p>Please check the browser console for more details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiService] = useState(() => new GeneralAIService());
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);

  const handleVoiceResult = async (result: VoiceRecognitionResult) => {
    console.log('=== Voice result received ===');
    console.log('Transcript:', result.transcript);
    console.log('Confidence:', result.confidence);
    
    try {
      console.log('Calling AI service with:', result.transcript);
      const response = await aiService.answerQuestion(result.transcript);
      
      console.log('AI service response:', response);
      
      // Set the answer text
      if (response.answer) {
        setCurrentAnswer(response.answer);
        console.log('Set current answer:', response.answer);
      } else {
        // Fallback for when AI service fails
        const fallbackAnswer = {
          answer: "I'm having trouble connecting to my AI service right now. However, I can still help you with locations! Try asking about specific cities, landmarks, or geographical features, and I'll show you where they are on the map.",
          location: undefined
        };
        setCurrentAnswer(fallbackAnswer.answer);
        console.log('Set current answer:', fallbackAnswer.answer);
      }
      
      // If there's a location, show it on the map AND combine with answer
      if (response.location) {
        console.log('Setting location:', response.location);
        setSelectedLocation(response.location);
        setError(null);
      } else {
        console.log('No location found in response');
        setSelectedLocation(null);
        setError(null);
      }
    } catch (err) {
      console.error('Error in handleVoiceResult:', err);
      // Handle errors gracefully
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`I couldn't process your question: "${result.transcript}". Please try again.`);
      }
      setCurrentAnswer(null);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const closeError = () => {
    setError(null);
  };

  return (
    <ErrorBoundary>
      <div className="App">
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      
      <Header />
      
      <MapComponent 
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
        aiAnswer={currentAnswer}
      />
      
      <VoiceButton
        onVoiceResult={handleVoiceResult}
        onError={handleError}
        isListening={isListening}
        setIsListening={setIsListening}
      />
      
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '350px',
            zIndex: 1000,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '16px' }}>
                Error
              </h4>
              <p style={{ margin: '0', color: '#7f1d1d', fontSize: '14px', lineHeight: '1.5' }}>
                {error}
              </p>
            </div>
            <button
              onClick={closeError}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#991b1b',
                padding: '0',
                marginLeft: '12px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {isListening && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '12px 16px',
            zIndex: 999,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          <p style={{ margin: '0', color: '#1e40af', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>🔴</span>
            Listening... Speak clearly into your microphone
          </p>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default App;
