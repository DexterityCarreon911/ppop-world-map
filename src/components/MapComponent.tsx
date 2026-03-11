import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../types';

// MapController component to handle all map operations
interface MapControllerProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  aiAnswer: string | null;
  onMarkerReady: (marker: L.Marker) => void;
}

const MapController: React.FC<MapControllerProps> = ({ selectedLocation, onLocationSelect, aiAnswer, onMarkerReady }) => {
  const map = useMap();
  const hasSpokenRef = useRef(false);

  // Function to speak text
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      console.log('=== MapController: Zooming to location ===');
      console.log('Location:', selectedLocation);
      console.log('AI Answer:', aiAnswer);

      // Zoom to location with smooth animation
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 10, {
        animate: true,
        duration: 2.0,
        easeLinearity: 0.5
      });

      // Reset speaking flag for new location
      hasSpokenRef.current = false;
    }
  }, [selectedLocation, map, aiAnswer]);

  // Handle auto-speaking after marker is ready
  useEffect(() => {
    if (aiAnswer && selectedLocation && !hasSpokenRef.current) {
      console.log('=== MapController: Auto-speaking AI answer ===');
      console.log('AI Answer:', aiAnswer);

      // Auto-speak after zoom and popup are set up
      const speakTimer = setTimeout(() => {
        speakText(aiAnswer);
        hasSpokenRef.current = true;
      }, 1500); // Wait for zoom and popup to be ready

      return () => clearTimeout(speakTimer);
    }
  }, [aiAnswer, selectedLocation]);

  return null;
};

// Main MapComponent
interface MapComponentProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  aiAnswer: string | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedLocation, onLocationSelect, aiAnswer }) => {
  const [markerRef, setMarkerRef] = useState<L.Marker | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Function to speak text
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);

      // Set joyful and energetic voice settings
      utterance.rate = 1.2; // Slightly faster for energy
      utterance.pitch = 1.1; // Slightly higher pitch for joyfulness
      utterance.volume = 0.9; // Good volume level

      // Try to select a female voice for more joyful tone
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('girl') ||
        voice.lang.startsWith('en-US')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name);
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Set US bounds
  const usBounds: L.LatLngBoundsExpression = [
    [25.0, -125.0], // Southwest corner
    [49.0, -66.0]   // Northeast corner
  ];

  // Create popup content
  const createPopupContent = (location: Location, answer: string | null) => {
    if (answer) {
      return `
        <div style="min-width: 300px; max-width: 400px;">
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
              AI Response
            </h3>
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
              ${answer}
            </p>
          </div>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 12px;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
              ${location.name}
            </h4>
            <div style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">
              <strong>Coordinates:</strong> ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
            </div>
            <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.5;">
              ${location.description}
            </p>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
            ${location.name}
          </h3>
          <div style="font-size: 13px; color: #4b5563; margin-bottom: 6px;">
            <strong>Coordinates:</strong> ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
          </div>
          <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.5;">
            ${location.description}
          </p>
        </div>
      `;
    }
  };

  // Handle marker ready callback
  const handleMarkerReady = (marker: L.Marker) => {
    console.log('=== Marker ready, opening popup ===');
    setMarkerRef(marker);

    // Open popup after marker is ready
    setTimeout(() => {
      if (marker) {
        marker.openPopup();
        console.log('Popup opened');
      }
    }, 500);
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        maxBounds={usBounds}
        maxBoundsViscosity={0.5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedLocation={selectedLocation}
          onLocationSelect={onLocationSelect}
          aiAnswer={aiAnswer}
          onMarkerReady={handleMarkerReady}
        />

        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            ref={(ref) => {
              if (ref && !markerRef) {
                handleMarkerReady(ref);
              }
            }}
          >
            <Popup maxWidth={400} className="custom-popup">
              <div dangerouslySetInnerHTML={{ __html: createPopupContent(selectedLocation, aiAnswer) }} />
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Manual speak button (optional) */}
      {aiAnswer && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            background: isSpeaking ? '#dc2626' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => speakText(aiAnswer)}
          title={isSpeaking ? 'Stop Speaking' : 'Speak Answer'}
        >
          {isSpeaking ? '🔇' : '🔊'}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
