import { VoiceRecognitionResult } from '../types';

// Speech Recognition API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  async startListening(retries = 3): Promise<VoiceRecognitionResult> {
    try {
      return await new Promise<VoiceRecognitionResult>((resolve, reject) => {
        if (!this.recognition) {
          reject(new Error('Speech recognition is not supported in this browser'));
          return;
        }

        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[0][0];
          resolve({
            transcript: result.transcript,
            confidence: result.confidence
          });
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          reject(new Error(event.error));
        };

        this.recognition.start();
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage === 'network' && retries > 0) {
        console.warn(`Speech recognition network error. Retrying... (${retries} attempts left)`);
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.startListening(retries - 1);
      }

      throw new Error(`Speech recognition error: ${errorMessage}`);
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
