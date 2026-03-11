export interface Location {
  name: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl?: string;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
}

export interface MapMarker {
  location: Location;
  id: string;
}
