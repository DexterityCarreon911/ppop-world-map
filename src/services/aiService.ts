import { Location } from '../types';
import { SearchService } from './searchService';

// AI Service with real API integration
export class AIService {
  private apiKey: string;
  private apiUrl: string;
  private searchService: SearchService;
  private locationDatabase: { [key: string]: Location } = {
    'grand canyon': {
      name: 'Grand Canyon',
      lat: 36.1069,
      lng: -112.1129,
      description: 'The Grand Canyon is a steep-sided canyon carved by the Colorado River in Arizona, United States. It is 277 miles long, up to 18 miles wide, and attains a depth of over a mile.'
    },
    'statue of liberty': {
      name: 'Statue of Liberty',
      lat: 40.6892,
      lng: -74.0445,
      description: 'The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor, New York City. The statue was a gift from the people of France to people of the United States.'
    },
    'golden gate bridge': {
      name: 'Golden Gate Bridge',
      lat: 37.8199,
      lng: -122.4783,
      description: 'The Golden Gate Bridge is a suspension bridge spanning the Golden Gate, the one-mile-wide strait connecting San Francisco Bay and the Pacific Ocean.'
    },
    'mount rushmore': {
      name: 'Mount Rushmore',
      lat: 43.8791,
      lng: -103.4591,
      description: 'Mount Rushmore National Memorial is a massive sculpture carved into the Black Hills near Keystone, South Dakota. It features the faces of four U.S. presidents.'
    },
    'yellowstone': {
      name: 'Yellowstone National Park',
      lat: 44.4280,
      lng: -110.5885,
      description: 'Yellowstone National Park is an American national park located in the western United States, largely in the northwest corner of Wyoming and extending into Montana and Idaho.'
    },
    'niagara falls': {
      name: 'Niagara Falls',
      lat: 43.0962,
      lng: -79.0377,
      description: 'Niagara Falls is a group of three waterfalls at the southern end of Niagara Gorge, spanning the border between the province of Ontario in Canada and the state of New York in the United States.'
    },
    'disney world': {
      name: 'Walt Disney World',
      lat: 28.3852,
      lng: -81.5639,
      description: 'Walt Disney World Resort is an entertainment complex in Bay Lake and Lake Buena Vista, Florida, near Orlando and Kissimmee.'
    },
    'las vegas': {
      name: 'Las Vegas',
      lat: 36.1699,
      lng: -115.1398,
      description: 'Las Vegas is a city in Nevada known for its vibrant nightlife, centered around 24-hour casinos and other entertainment options.'
    },
    'washington dc': {
      name: 'Washington, D.C.',
      lat: 38.9072,
      lng: -77.0369,
      description: 'Washington, D.C. is the capital of the United States, known for its iconic monuments and museums, including the White House and Capitol Building.'
    },
    'hollywood': {
      name: 'Hollywood',
      lat: 34.0928,
      lng: -118.3287,
      description: 'Hollywood is a neighborhood in Los Angeles, California, known as the center of the U.S. film industry.'
    }
  };

  constructor() {
    this.apiKey = process.env.REACT_APP_AI_API_KEY || '';
    this.apiUrl = process.env.REACT_APP_AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.searchService = new SearchService();
  }

  private async callAI(question: string): Promise<Location | null> {
    if (!this.apiKey) {
      console.warn('No AI API key found, falling back to mock database');
      return this.fallbackToMockDatabase(question);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a location finder for American places. When asked about a location in the United States, respond ONLY with a JSON object containing:
              {
                "name": "Location Name",
                "lat": latitude as number,
                "lng": longitude as number,
                "description": "Brief description of the place"
              }
              
              If you cannot find the location or it's not in the United States, respond with {"error": "Location not found"}`
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const content = data.choices[0].message.content;
        try {
          const locationData = JSON.parse(content);
          if (locationData.error) {
            return null;
          }
          return {
            name: locationData.name,
            lat: parseFloat(locationData.lat),
            lng: parseFloat(locationData.lng),
            description: locationData.description
          };
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('AI API call failed:', error);
      return this.fallbackToMockDatabase(question);
    }
  }

  private fallbackToMockDatabase(question: string): Location | null {
    const lowerQuestion = question.toLowerCase();
    
    console.log('Analyzing question:', question); // Debug log
    
    // Remove common question words
    const cleanQuestion = lowerQuestion
      .replace(/where is/g, '')
      .replace(/what is/g, '')
      .replace(/tell me about/g, '')
      .replace(/show me/g, '')
      .replace(/find/g, '')
      .replace(/locate/g, '')
      .replace(/take me to/g, '')
      .replace(/navigate to/g, '')
      .replace(/\?/g, '')
      .replace(/\./g, '')
      .trim();

    console.log('Clean question:', cleanQuestion); // Debug log

    // Check for exact matches first
    if (this.locationDatabase[cleanQuestion]) {
      console.log('Exact match found:', cleanQuestion);
      return this.locationDatabase[cleanQuestion];
    }

    // Check for partial matches - more flexible
    for (const [key, location] of Object.entries(this.locationDatabase)) {
      if (key.includes(cleanQuestion) || cleanQuestion.includes(key)) {
        console.log('Partial match found:', key);
        return location;
      }
    }

    // Check for keywords in the question - improved matching
    for (const [key, location] of Object.entries(this.locationDatabase)) {
      const keywords = key.split(' ');
      for (const keyword of keywords) {
        if (cleanQuestion.includes(keyword)) {
          console.log('Keyword match found:', keyword);
          return location;
        }
      }
    }

    // Additional matching patterns
    const patterns = {
      'grand canyon': ['canyon', 'arizona', 'colorado'],
      'statue of liberty': ['liberty', 'statue', 'new york', 'freedom'],
      'golden gate bridge': ['golden gate', 'bridge', 'san francisco', 'sf'],
      'mount rushmore': ['rushmore', 'mount', 'presidents', 'south dakota'],
      'yellowstone': ['yellowstone', 'geyser', 'wyoming', 'park'],
      'niagara falls': ['niagara', 'falls', 'waterfall'],
      'disney world': ['disney', 'orlando', 'theme park', 'mickey'],
      'las vegas': ['vegas', 'casino', 'nevada', 'sin city'],
      'washington dc': ['washington', 'dc', 'white house', 'capitol'],
      'hollywood': ['hollywood', 'movies', 'los angeles', 'la']
    };

    for (const [locationKey, keywords] of Object.entries(patterns)) {
      for (const keyword of keywords) {
        if (cleanQuestion.includes(keyword)) {
          console.log('Pattern match found:', locationKey, 'via keyword:', keyword);
          return this.locationDatabase[locationKey];
        }
      }
    }

    console.log('No match found for:', question);
    return null;
  }

  async analyzeQuestion(question: string): Promise<Location | null> {
    console.log('Analyzing question:', question);
    
    // Check if this is a location-related question
    const locationKeywords = [
      'where is', 'what is', 'show me', 'find', 'locate', 'take me to', 
      'navigate to', 'how to get to', 'directions to', 'map of',
      'capital', 'city', 'state', 'country', 'park', 'mountain', 'bridge',
      'monument', 'landmark', 'building', 'museum', 'airport', 'station'
    ];
    
    const isLocationQuestion = locationKeywords.some(keyword => 
      question.toLowerCase().includes(keyword)
    );
    
    // If not a location question, return helpful message
    if (!isLocationQuestion) {
      console.log('Not a location question:', question);
      throw new Error('Please ask about a location. Try questions like "Where is the Grand Canyon?" or "Show me the Statue of Liberty".');
    }
    
    // First try AI API if available
    if (this.apiKey) {
      try {
        const aiResult = await this.callAI(question);
        if (aiResult) {
          console.log('AI API found location:', aiResult);
          return aiResult;
        }
      } catch (error) {
        console.error('AI API failed, trying search:', error);
      }
    }
    
    // Try internet search
    console.log('Trying internet search for:', question);
    try {
      const searchResult = await this.searchService.searchLocation(question);
      if (searchResult) {
        console.log('Internet search found location:', searchResult);
        return searchResult;
      }
    } catch (error) {
      console.error('Internet search failed, trying mock database:', error);
    }
    
    // Fallback to mock database
    console.log('Using mock database for:', question);
    return this.fallbackToMockDatabase(question);
  }
}
