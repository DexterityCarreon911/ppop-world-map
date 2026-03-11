import { Location } from '../types';

export class SearchService {
  private async searchWikipedia(query: string): Promise<Location | null> {
    try {
      // Search Wikipedia for the location
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      // Check if the location has coordinates
      if (data.coordinates && data.lat && data.lon) {
        return {
          name: data.title || query,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
          description: data.extract || `Information about ${query} from Wikipedia`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Wikipedia search failed:', error);
      return null;
    }
  }

  private async searchOpenStreetMap(query: string): Promise<Location | null> {
    try {
      // Search OpenStreetMap Nominatim with strict US filtering
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=US&limit=5&addressdetails=1&bounded=1&viewbox=-125,49,-66,25`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'VoiceControlledMap/1.0'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        // Filter results to ensure they're actually in the US and not generic matches
        const validResults = data.filter((result: any) => {
          const displayName = result.display_name || '';
          const address = result.address || {};

          // Must be in United States
          if (!displayName.includes('United States') && address.country_code !== 'us') {
            return false;
          }

          // Reject Los Angeles as default fallback unless specifically requested
          if (displayName.includes('Los Angeles') && !query.toLowerCase().includes('los angeles') && !query.toLowerCase().includes('la ')) {
            return false;
          }

          // Specific landmark validations
          if (query.toLowerCase().includes('canyon') && !displayName.includes('Arizona') && !displayName.includes('Canyon')) {
            return false;
          }

          if (query.toLowerCase().includes('falls') && !displayName.includes('New York') && !displayName.includes('Niagara')) {
            return false;
          }

          if (query.toLowerCase().includes('bridge') && !displayName.includes('San Francisco') && !displayName.includes('Golden Gate')) {
            return false;
          }

          if (query.toLowerCase().includes('rushmore') && !displayName.includes('South Dakota') && !displayName.includes('Rushmore')) {
            return false;
          }

          if (query.toLowerCase().includes('yellowstone') && !displayName.includes('Wyoming') && !displayName.includes('Yellowstone')) {
            return false;
          }

          return true;
        });

        if (validResults.length > 0) {
          const result = validResults[0];
          console.log('OSM result:', result);

          return {
            name: result.display_name.split(',')[0] || query,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            description: `Location found: ${result.display_name}`
          };
        }
      }

      return null;
    } catch (error) {
      console.error('OpenStreetMap search failed:', error);
      return null;
    }
  }

  async searchLocation(query: string): Promise<Location | null> {
    const cleanQuery = query.toLowerCase().trim();

    // Famous US landmarks with hardcoded coordinates for accuracy
    const landmarkCoordinates: { [key: string]: Location } = {
      'grand canyon': {
        name: 'Grand Canyon National Park',
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
      },
      'white house': {
        name: 'White House',
        lat: 38.8977,
        lng: -77.0365,
        description: 'The White House is the official residence and workplace of the President of the United States, located at 1600 Pennsylvania Avenue Northwest in Washington, D.C.'
      },
      'times square': {
        name: 'Times Square',
        lat: 40.7589,
        lng: -73.9851,
        description: 'Times Square is a major commercial intersection and neighborhood in Midtown Manhattan, New York City, known for its bright lights and Broadway theaters.'
      },
      'central park': {
        name: 'Central Park',
        lat: 40.7829,
        lng: -73.9654,
        description: 'Central Park is an urban park in New York City located between the Upper West Side and Upper East Side, covering 843 acres of land.'
      },
      'empire state building': {
        name: 'Empire State Building',
        lat: 40.7484,
        lng: -73.9857,
        description: 'The Empire State Building is a 102-story Art Deco skyscraper in Midtown Manhattan, New York City, completed in 1931.'
      },
      'one world trade': {
        name: 'One World Trade Center',
        lat: 40.7127,
        lng: -74.0134,
        description: 'One World Trade Center is the main building of the rebuilt World Trade Center complex in Lower Manhattan, New York City.'
      },
      'us canada border': {
        name: 'US-Canada Border',
        lat: 49.0,
        lng: -95.0,
        description: 'The US-Canada border stretches approximately 5,525 miles (8,891 km) along the northern border of the United States and the southern border of Canada.'
      },
      'canada border': {
        name: 'US-Canada Border',
        lat: 49.0,
        lng: -95.0,
        description: 'The US-Canada border stretches approximately 5,525 miles (8,891 km) along the northern border of the United States and the southern border of Canada.'
      },
      'usa border': {
        name: 'US-Canada Border',
        lat: 49.0,
        lng: -95.0,
        description: 'The US-Canada border stretches approximately 5,525 miles (8,891 km) along the northern border of the United States and the southern border of Canada.'
      },
      'northern border': {
        name: 'US-Canada Border',
        lat: 49.0,
        lng: -95.0,
        description: 'The US-Canada border stretches approximately 5,525 miles (8,891 km) along the northern border of the United States and the southern border of Canada.'
      },
      'capital city': {
        name: 'Washington, D.C.',
        lat: 38.9072,
        lng: -77.0369,
        description: 'Washington, D.C. is the capital of the United States, known for its iconic monuments and museums, including the White House and Capitol Building.'
      },
      'usa capital': {
        name: 'Washington, D.C.',
        lat: 38.9072,
        lng: -77.0369,
        description: 'Washington, D.C. is the capital of the United States, known for its iconic monuments and museums, including the White House and Capitol Building.'
      },

      // Major US Cities with hardcoded coordinates
      'new york city': {
        name: 'New York City, NY',
        lat: 40.7128,
        lng: -74.0060,
        description: 'New York City is the most populous city in the United States, known for its iconic skyline, Broadway theater, and cultural diversity.'
      },
      'new york': {
        name: 'New York City, NY',
        lat: 40.7128,
        lng: -74.0060,
        description: 'New York City is the most populous city in the United States, known for its iconic skyline, Broadway theater, and cultural diversity.'
      },
      'nyc': {
        name: 'New York City, NY',
        lat: 40.7128,
        lng: -74.0060,
        description: 'New York City is the most populous city in the United States, known for its iconic skyline, Broadway theater, and cultural diversity.'
      },
      'los angeles': {
        name: 'Los Angeles, CA',
        lat: 34.0522,
        lng: -118.2437,
        description: 'Los Angeles is a sprawling Southern California city known for its Mediterranean climate, ethnic diversity, and Hollywood entertainment industry.'
      },
      'la': {
        name: 'Los Angeles, CA',
        lat: 34.0522,
        lng: -118.2437,
        description: 'Los Angeles is a sprawling Southern California city known for its Mediterranean climate, ethnic diversity, and Hollywood entertainment industry.'
      },
      'chicago': {
        name: 'Chicago, IL',
        lat: 41.8781,
        lng: -87.6298,
        description: 'Chicago is the third-most populous city in the United States, known for its architecture, cultural attractions, and lakefront location.'
      },
      'houston': {
        name: 'Houston, TX',
        lat: 29.7604,
        lng: -95.3698,
        description: 'Houston is the most populous city in Texas and the fourth-most populous city in the United States, known for its port and petrochemical industry.'
      },
      'phoenix': {
        name: 'Phoenix, AZ',
        lat: 33.4484,
        lng: -112.0740,
        description: 'Phoenix is the capital and most populous city of Arizona, known for its desert climate and being one of the fastest-growing cities in the US.'
      },
      'philadelphia': {
        name: 'Philadelphia, PA',
        lat: 39.9526,
        lng: -75.1652,
        description: 'Philadelphia is the sixth-most populous city in the United States, known for its history as the temporary U.S. capital and birthplace of American democracy.'
      },
      'san antonio': {
        name: 'San Antonio, TX',
        lat: 29.4241,
        lng: -98.4936,
        description: 'San Antonio is the seventh-most populous city in the United States, known for the Alamo, River Walk, and Spanish colonial missions.'
      },
      'san diego': {
        name: 'San Diego, CA',
        lat: 32.7157,
        lng: -117.1611,
        description: 'San Diego is a major city in Southern California, known for its mild climate, extensive coastline, and being home to the U.S. Navy.'
      },
      'dallas': {
        name: 'Dallas, TX',
        lat: 32.7767,
        lng: -96.7970,
        description: 'Dallas is the ninth-most populous city in the United States, known for its role in the oil and cotton industries and modern skyline.'
      },
      'san jose': {
        name: 'San Jose, CA',
        lat: 37.3382,
        lng: -121.8863,
        description: 'San Jose is the tenth-most populous city in the United States, known as the heart of Silicon Valley and for its technology industry.'
      },
      'austin': {
        name: 'Austin, TX',
        lat: 30.2672,
        lng: -97.7431,
        description: 'Austin is the eleventh-most populous city in the United States, known for its live music scene, outdoor recreation, and being the state capital of Texas.'
      },
      'jacksonville': {
        name: 'Jacksonville, FL',
        lat: 30.3322,
        lng: -81.6557,
        description: 'Jacksonville is the twelfth-most populous city in the United States, known for its port and being the largest city by area in the contiguous U.S.'
      },
      'fort worth': {
        name: 'Fort Worth, TX',
        lat: 32.7555,
        lng: -97.3308,
        description: 'Fort Worth is the thirteenth-most populous city in the United States, known for its history as a cattle town and cultural attractions.'
      },
      'columbus': {
        name: 'Columbus, OH',
        lat: 39.9612,
        lng: -82.9988,
        description: 'Columbus is the fourteenth-most populous city in the United States, known for being the state capital of Ohio and its university presence.'
      },
      'indianapolis': {
        name: 'Indianapolis, IN',
        lat: 39.7684,
        lng: -86.1581,
        description: 'Indianapolis is the fifteenth-most populous city in the United States, known for the Indianapolis 500 race and being the state capital of Indiana.'
      },
      'charlotte': {
        name: 'Charlotte, NC',
        lat: 35.2271,
        lng: -80.8431,
        description: 'Charlotte is the sixteenth-most populous city in the United States, known for its banking industry and being a major financial center.'
      },
      'san francisco': {
        name: 'San Francisco, CA',
        lat: 37.7749,
        lng: -122.4194,
        description: 'San Francisco is known for its iconic Golden Gate Bridge, Alcatraz Island, and its role as a cultural and financial center.'
      },
      'sf': {
        name: 'San Francisco, CA',
        lat: 37.7749,
        lng: -122.4194,
        description: 'San Francisco is known for its iconic Golden Gate Bridge, Alcatraz Island, and its role as a cultural and financial center.'
      },
      'seattle': {
        name: 'Seattle, WA',
        lat: 47.6062,
        lng: -122.3321,
        description: 'Seattle is known for its coffee culture, music scene, and being headquarters to companies like Amazon and Starbucks.'
      },
      'denver': {
        name: 'Denver, CO',
        lat: 39.7392,
        lng: -104.9903,
        description: 'Denver is the capital and most populous city of Colorado, known for its proximity to the Rocky Mountains and outdoor recreation.'
      },
      'boston': {
        name: 'Boston, MA',
        lat: 42.3601,
        lng: -71.0589,
        description: 'Boston is known for its history, universities like Harvard and MIT, and its role in the American Revolution.'
      },
      'el paso': {
        name: 'El Paso, TX',
        lat: 31.7619,
        lng: -106.4850,
        description: 'El Paso is located on the Rio Grande in far West Texas, known for its international trade and cultural diversity.'
      },
      'detroit': {
        name: 'Detroit, MI',
        lat: 42.3314,
        lng: -83.0458,
        description: 'Detroit is known for its automotive industry, Motown music, and the Renaissance Center.'
      },
      'nashville': {
        name: 'Nashville, TN',
        lat: 36.1627,
        lng: -86.7816,
        description: 'Nashville is known as Music City for its country music industry and being the state capital of Tennessee.'
      },
      'portland': {
        name: 'Portland, OR',
        lat: 45.5152,
        lng: -122.6784,
        description: 'Portland is known for its environmental consciousness, craft beer scene, and proximity to outdoor recreation.'
      },
      'memphis': {
        name: 'Memphis, TN',
        lat: 35.1495,
        lng: -90.0490,
        description: 'Memphis is known for its music heritage, including blues and soul, and being the birthplace of rock and roll.'
      },
      'oklahoma city': {
        name: 'Oklahoma City, OK',
        lat: 35.4676,
        lng: -97.5164,
        description: 'Oklahoma City is the capital and largest city of Oklahoma, known for its energy industry and tornado history.'
      },
      'vegas': {
        name: 'Las Vegas, NV',
        lat: 36.1699,
        lng: -115.1398,
        description: 'Las Vegas is known for its casinos, entertainment, and being a major resort city in the Mojave Desert.'
      },
      'louisville': {
        name: 'Louisville, KY',
        lat: 38.2527,
        lng: -85.7585,
        description: 'Louisville is known for the Kentucky Derby horse race and its bourbon distilling heritage.'
      },
      'baltimore': {
        name: 'Baltimore, MD',
        lat: 39.2904,
        lng: -76.6122,
        description: 'Baltimore is known for its port, National Aquarium, and being home to Johns Hopkins University.'
      },
      'milwaukee': {
        name: 'Milwaukee, WI',
        lat: 43.0389,
        lng: -87.9065,
        description: 'Milwaukee is known for its brewing heritage, Harley-Davidson motorcycles, and Lake Michigan waterfront.'
      },
      'albuquerque': {
        name: 'Albuquerque, NM',
        lat: 35.0844,
        lng: -106.6504,
        description: 'Albuquerque is the largest city in New Mexico, known for its desert climate and proximity to natural wonders.'
      },
      'tucson': {
        name: 'Tucson, AZ',
        lat: 32.2226,
        lng: -110.9747,
        description: 'Tucson is known for its desert climate, Saguaro cacti, and University of Arizona.'
      },
      'fresno': {
        name: 'Fresno, CA',
        lat: 36.7378,
        lng: -119.7871,
        description: 'Fresno is known for its agricultural industry and being the gateway to Yosemite National Park.'
      },
      'sacramento': {
        name: 'Sacramento, CA',
        lat: 38.5816,
        lng: -121.4944,
        description: 'Sacramento is the capital city of California, known for its government buildings and river location.'
      },
      'mesa': {
        name: 'Mesa, AZ',
        lat: 33.4152,
        lng: -111.8315,
        description: 'Mesa is known for its desert climate and being one of the fastest-growing cities in the United States.'
      },
      'kansas city': {
        name: 'Kansas City, MO',
        lat: 39.0997,
        lng: -94.5786,
        description: 'Kansas City is known for its barbecue, jazz heritage, and being located at the confluence of the Missouri and Kansas Rivers.'
      },
      'atlanta': {
        name: 'Atlanta, GA',
        lat: 33.7490,
        lng: -84.3880,
        description: 'Atlanta is known for its role in the Civil Rights Movement, CNN headquarters, and being a major transportation hub.'
      },
      'long beach': {
        name: 'Long Beach, CA',
        lat: 33.7701,
        lng: -118.1937,
        description: 'Long Beach is known for its port, Queen Mary ship, and aerospace industry.'
      },
      'colorado springs': {
        name: 'Colorado Springs, CO',
        lat: 38.8339,
        lng: -104.8214,
        description: 'Colorado Springs is known for its proximity to Pikes Peak and being home to the U.S. Olympic Training Center.'
      },
      'raleigh': {
        name: 'Raleigh, NC',
        lat: 35.7796,
        lng: -78.6382,
        description: 'Raleigh is the capital of North Carolina, known for its Research Triangle and being part of the Triangle region.'
      },
      'miami': {
        name: 'Miami, FL',
        lat: 25.7617,
        lng: -80.1918,
        description: 'Miami is known for its beaches, Art Deco architecture, and being a major international trade and finance center.'
      },
      'virginia beach': {
        name: 'Virginia Beach, VA',
        lat: 36.8529,
        lng: -75.9780,
        description: 'Virginia Beach is known for its beaches, boardwalk, and being the most populous city in Virginia.'
      },
      'omaha': {
        name: 'Omaha, NE',
        lat: 41.2565,
        lng: -95.9345,
        description: 'Omaha is known for its meatpacking industry, Warren Buffett\'s headquarters, and being located on the Missouri River.'
      },
      'oakland': {
        name: 'Oakland, CA',
        lat: 37.8044,
        lng: -122.2711,
        description: 'Oakland is known for its port, Raiders football team, and being part of the San Francisco Bay Area.'
      },
      'minneapolis': {
        name: 'Minneapolis, MN',
        lat: 44.9778,
        lng: -93.2650,
        description: 'Minneapolis is known for its lakes, arts scene, and being twin city to St. Paul across the Mississippi River.'
      },
      'tulsa': {
        name: 'Tulsa, OK',
        lat: 36.1540,
        lng: -95.9928,
        description: 'Tulsa is known for its oil industry heritage, art deco architecture, and being located along the Arkansas River.'
      },
      'tampa': {
        name: 'Tampa, FL',
        lat: 27.9506,
        lng: -82.4572,
        description: 'Tampa is known for its port, Busch Gardens theme park, and warm climate.'
      },
      'arlington': {
        name: 'Arlington, TX',
        lat: 32.7357,
        lng: -97.1081,
        description: 'Arlington is known for the Texas Rangers baseball team, Six Flags theme park, and being part of the Dallas-Fort Worth metroplex.'
      },
      'new orleans': {
        name: 'New Orleans, LA',
        lat: 29.9511,
        lng: -90.0715,
        description: 'New Orleans is known for its jazz music, Creole cuisine, Mardi Gras celebrations, and French Quarter.'
      },
      'wichita': {
        name: 'Wichita, KS',
        lat: 37.6872,
        lng: -97.3301,
        description: 'Wichita is known for its aircraft manufacturing industry and being located on the Arkansas River.'
      },
      'cleveland': {
        name: 'Cleveland, OH',
        lat: 41.4993,
        lng: -81.6944,
        description: 'Cleveland is known for its Rock and Roll Hall of Fame, West Side Market, and Lake Erie location.'
      },
      'bakersfield': {
        name: 'Bakersfield, CA',
        lat: 35.3733,
        lng: -119.0187,
        description: 'Bakersfield is known for its country music scene, oil industry, and being the largest city in the San Joaquin Valley.'
      },
      'aurora': {
        name: 'Aurora, CO',
        lat: 39.7392,
        lng: -104.9903,
        description: 'Aurora is known for its aerospace industry and being one of the largest suburbs of Denver.'
      },
      'anaheim': {
        name: 'Anaheim, CA',
        lat: 33.8366,
        lng: -117.9143,
        description: 'Anaheim is known for Disneyland Resort and being part of Orange County.'
      },
      'honolulu': {
        name: 'Honolulu, HI',
        lat: 21.3099,
        lng: -157.8581,
        description: 'Honolulu is the capital and largest city of Hawaii, known for its beaches, Pearl Harbor, and Waikiki.'
      },
      'corona ca': {
        name: 'Corona, CA',
        lat: 33.8753,
        lng: -117.5664,
        description: 'Corona is known for its suburban development and being part of the Inland Empire.'
      },
      'lexington': {
        name: 'Lexington, KY',
        lat: 38.0406,
        lng: -84.5037,
        description: 'Lexington is known for its thoroughbred horse farms and being the horse capital of the world.'
      },
      'stockton': {
        name: 'Stockton, CA',
        lat: 37.9577,
        lng: -121.2908,
        description: 'Stockton is known for its port on the San Joaquin River and being part of the Central Valley.'
      },
      'henderson': {
        name: 'Henderson, NV',
        lat: 36.0395,
        lng: -114.9817,
        description: 'Henderson is known for its lake, valley location, and being a suburb of Las Vegas.'
      },
      'saint paul': {
        name: 'Saint Paul, MN',
        lat: 44.9537,
        lng: -93.0900,
        description: 'Saint Paul is the capital of Minnesota, known for its Victorian architecture and being twin city to Minneapolis.'
      },
      'st paul': {
        name: 'Saint Paul, MN',
        lat: 44.9537,
        lng: -93.0900,
        description: 'Saint Paul is the capital of Minnesota, known for its Victorian architecture and being twin city to Minneapolis.'
      },
      'st. paul': {
        name: 'Saint Paul, MN',
        lat: 44.9537,
        lng: -93.0900,
        description: 'Saint Paul is the capital of Minnesota, known for its Victorian architecture and being twin city to Minneapolis.'
      },
      'cincinnati': {
        name: 'Cincinnati, OH',
        lat: 39.1031,
        lng: -84.5120,
        description: 'Cincinnati is known for its chili, baseball team, and being located at the confluence of the Ohio and Licking Rivers.'
      },
      'pittsburgh': {
        name: 'Pittsburgh, PA',
        lat: 40.4406,
        lng: -79.9959,
        description: 'Pittsburgh is known for its steel industry heritage, universities, and three major sports teams.'
      },
      'greensboro': {
        name: 'Greensboro, NC',
        lat: 36.0726,
        lng: -79.7920,
        description: 'Greensboro is known for its furniture industry and being a major city in the Piedmont Triad region.'
      },
      'anchorage': {
        name: 'Anchorage, AK',
        lat: 61.2181,
        lng: -149.9003,
        description: 'Anchorage is the largest city in Alaska, known for its wilderness access and being a major port.'
      },
      'plano': {
        name: 'Plano, TX',
        lat: 33.0198,
        lng: -96.6989,
        description: 'Plano is known for its corporate headquarters and being one of the largest suburbs in the Dallas area.'
      },
      'lincoln': {
        name: 'Lincoln, NE',
        lat: 40.8136,
        lng: -96.7026,
        description: 'Lincoln is the capital and second-largest city of Nebraska, known for its university and state capitol.'
      },
      'orlando': {
        name: 'Orlando, FL',
        lat: 28.5383,
        lng: -81.3792,
        description: 'Orlando is known for Walt Disney World, Universal Studios, and being a major tourist destination.'
      },
      'irvine': {
        name: 'Irvine, CA',
        lat: 33.6846,
        lng: -117.8265,
        description: 'Irvine is known for its master-planned communities and being home to the University of California, Irvine.'
      },
      'newark': {
        name: 'Newark, NJ',
        lat: 40.7357,
        lng: -74.1724,
        description: 'Newark is known for its port, airport, and being part of the New York metropolitan area.'
      },
      'durham': {
        name: 'Durham, NC',
        lat: 35.9940,
        lng: -78.8986,
        description: 'Durham is known for its universities, including Duke University, and being part of the Research Triangle.'
      },
      'chula vista': {
        name: 'Chula Vista, CA',
        lat: 32.6401,
        lng: -117.0842,
        description: 'Chula Vista is known for its bayfront location and being the second-largest city in San Diego County.'
      },
      'toledo': {
        name: 'Toledo, OH',
        lat: 41.6528,
        lng: -83.5379,
        description: 'Toledo is known for its glassmaking industry and being located on the western end of Lake Erie.'
      },
      'fort wayne': {
        name: 'Fort Wayne, IN',
        lat: 41.0793,
        lng: -85.1394,
        description: 'Fort Wayne is known for its manufacturing industry and being located at the confluence of three rivers.'
      },
      'st petersburg': {
        name: 'St. Petersburg, FL',
        lat: 27.7663,
        lng: -82.6403,
        description: 'St. Petersburg is known for its beaches, museums, and being located across the bay from Tampa.'
      },
      'laredo': {
        name: 'Laredo, TX',
        lat: 27.5306,
        lng: -99.4803,
        description: 'Laredo is known for its international trade, being located on the Rio Grande, and Spanish colonial history.'
      },
      'jersey city': {
        name: 'Jersey City, NJ',
        lat: 40.7178,
        lng: -74.0431,
        description: 'Jersey City is known for its views of Manhattan and being part of the New York metropolitan area.'
      },
      'chandler': {
        name: 'Chandler, AZ',
        lat: 33.3062,
        lng: -111.8413,
        description: 'Chandler is known for its technology companies and being located in the Phoenix metropolitan area.'
      },
      'madison': {
        name: 'Madison, WI',
        lat: 43.0731,
        lng: -89.4012,
        description: 'Madison is the capital of Wisconsin, known for the University of Wisconsin and being located on four lakes.'
      },
      'lubbock': {
        name: 'Lubbock, TX',
        lat: 33.5779,
        lng: -101.8552,
        description: 'Lubbock is known for Texas Tech University and being located in the South Plains region.'
      },
      'scottsdale': {
        name: 'Scottsdale, AZ',
        lat: 33.4942,
        lng: -111.9261,
        description: 'Scottsdale is known for its desert resorts, golf courses, and art scene.'
      },
      'reno': {
        name: 'Reno, NV',
        lat: 39.5296,
        lng: -119.8138,
        description: 'Reno is known for its casinos, proximity to Lake Tahoe, and being part of the Truckee Meadows.'
      },
      'buffalo': {
        name: 'Buffalo, NY',
        lat: 42.8864,
        lng: -78.8784,
        description: 'Buffalo is known for its architecture, Niagara Falls proximity, and Great Lakes location.'
      },
      'gilbert': {
        name: 'Gilbert, AZ',
        lat: 33.3528,
        lng: -111.7890,
        description: 'Gilbert is known for its family-friendly communities and being one of the fastest-growing cities in Arizona.'
      },
      'glendale': {
        name: 'Glendale, AZ',
        lat: 33.5387,
        lng: -112.1860,
        description: 'Glendale is known for its outlet malls and being located in the Phoenix metropolitan area.'
      },
      'hartford': {
        name: 'Hartford, CT',
        lat: 41.7658,
        lng: -72.6734,
        description: 'Hartford is the capital of Connecticut, known for its insurance industry and being the oldest capital in the U.S.'
      },
      'salt lake city': {
        name: 'Salt Lake City, UT',
        lat: 40.7608,
        lng: -111.8910,
        description: 'Salt Lake City is the capital and largest city of Utah, known for its Mormon heritage and proximity to skiing.'
      },
      'fremont': {
        name: 'Fremont, CA',
        lat: 37.5485,
        lng: -121.9886,
        description: 'Fremont is known for its technology companies and being part of the San Francisco Bay Area.'
      },
      'hialeah': {
        name: 'Hialeah, FL',
        lat: 25.8576,
        lng: -80.2781,
        description: 'Hialeah is known for its Latin American culture and being a suburb of Miami.'
      },
      'garland': {
        name: 'Garland, TX',
        lat: 32.9126,
        lng: -96.6389,
        description: 'Garland is known for its diversity and being part of the Dallas-Fort Worth metroplex.'
      },
      'irving': {
        name: 'Irving, TX',
        lat: 32.8140,
        lng: -96.9489,
        description: 'Irving is known for Dallas/Fort Worth International Airport and being home to companies like ExxonMobil.'
      },
      'chesapeake': {
        name: 'Chesapeake, VA',
        lat: 36.7682,
        lng: -76.2875,
        description: 'Chesapeake is known for its military bases and being located in the Hampton Roads region.'
      },
      'virginia': {
        name: 'Virginia Beach, VA',
        lat: 36.8529,
        lng: -75.9780,
        description: 'Virginia Beach is known for its beaches, boardwalk, and being the most populous city in Virginia.'
      },
      'winston salem': {
        name: 'Winston-Salem, NC',
        lat: 36.0999,
        lng: -80.2442,
        description: 'Winston-Salem is known for its tobacco heritage, Wake Forest University, and being part of the Piedmont Triad.'
      },
      'durham nc': {
        name: 'Durham, NC',
        lat: 35.9940,
        lng: -78.8986,
        description: 'Durham is known for its universities, including Duke University, and being part of the Research Triangle.'
      },
      'north las vegas': {
        name: 'North Las Vegas, NV',
        lat: 36.1989,
        lng: -115.1175,
        description: 'North Las Vegas is known for its proximity to Las Vegas and being home to the Las Vegas Motor Speedway.'
      },
      'norfolk': {
        name: 'Norfolk, VA',
        lat: 36.8508,
        lng: -76.2859,
        description: 'Norfolk is known for its naval base, port, and being part of the Hampton Roads region.'
      },
      'frisco': {
        name: 'Frisco, TX',
        lat: 33.1507,
        lng: -96.8236,
        description: 'Frisco is known for its rapid growth, sports teams, and being a suburb north of Dallas.'
      },
      'springfield': {
        name: 'Springfield, MA',
        lat: 42.1015,
        lng: -72.5898,
        description: 'Springfield is known for the Basketball Hall of Fame and being located in Western Massachusetts.'
      },
      'mission viejo': {
        name: 'Mission Viejo, CA',
        lat: 33.6000,
        lng: -117.6720,
        description: 'Mission Viejo is known for its master-planned community and being part of Orange County.'
      },
      'sunnyvale': {
        name: 'Sunnyvale, CA',
        lat: 37.3688,
        lng: -122.0363,
        description: 'Sunnyvale is known for its technology companies and being part of Silicon Valley.'
      },
      'alexandria': {
        name: 'Alexandria, VA',
        lat: 38.8048,
        lng: -77.0469,
        description: 'Alexandria is known for its historic district and being a suburb of Washington, D.C.'
      },
      'paterson': {
        name: 'Paterson, NJ',
        lat: 40.9168,
        lng: -74.1718,
        description: 'Paterson is known for being the cradle of the Industrial Revolution in America.'
      },
      'huntsville': {
        name: 'Huntsville, AL',
        lat: 34.7304,
        lng: -86.5861,
        description: 'Huntsville is known for its space program history and being home to NASA\'s Marshall Space Flight Center.'
      },
      'bridgeport': {
        name: 'Bridgeport, CT',
        lat: 41.1865,
        lng: -73.1952,
        description: 'Bridgeport is known for its port and being the largest city in Connecticut.'
      },
      'savannah': {
        name: 'Savannah, GA',
        lat: 32.0809,
        lng: -81.0912,
        description: 'Savannah is known for its historic district, squares, and Spanish moss-draped oaks.'
      },
      'mesquite': {
        name: 'Mesquite, TX',
        lat: 32.7668,
        lng: -96.5992,
        description: 'Mesquite is known for its cotton industry heritage and being part of the Dallas metropolitan area.'
      },
      'overland park': {
        name: 'Overland Park, KS',
        lat: 38.9822,
        lng: -94.6708,
        description: 'Overland Park is known for its corporate headquarters and being a suburb of Kansas City.'
      },
      'santa clara': {
        name: 'Santa Clara, CA',
        lat: 37.3541,
        lng: -121.9552,
        description: 'Santa Clara is known for Levi\'s Stadium and being home to Intel Corporation.'
      },
      'macon': {
        name: 'Macon, GA',
        lat: 32.8407,
        lng: -83.6324,
        description: 'Macon is known for its Antebellum architecture and being located on the Ocmulgee Mounds National Historical Park.'
      },
      'providence': {
        name: 'Providence, RI',
        lat: 41.8240,
        lng: -71.4128,
        description: 'Providence is the capital and largest city of Rhode Island, known for Brown University and its colonial history.'
      },
      'killeen': {
        name: 'Killeen, TX',
        lat: 31.1171,
        lng: -97.7278,
        description: 'Killeen is known for Fort Hood military base and being located in Central Texas.'
      },
      'jackson': {
        name: 'Jackson, MS',
        lat: 32.2988,
        lng: -90.1848,
        description: 'Jackson is the capital and largest city of Mississippi, known for its civil rights history.'
      },
      'syracuse': {
        name: 'Syracuse, NY',
        lat: 43.0481,
        lng: -76.1474,
        description: 'Syracuse is known for its university, salt mining history, and being located on Lake Onondaga.'
      },
      'mcallen': {
        name: 'McAllen, TX',
        lat: 26.2034,
        lng: -98.2300,
        description: 'McAllen is known for its international trade and being located on the U.S.-Mexico border.'
      },
      'independence': {
        name: 'Independence, MO',
        lat: 39.0911,
        lng: -94.4155,
        description: 'Independence is known for its role in the Mormon history and being a suburb of Kansas City.'
      },
      'pasadena': {
        name: 'Pasadena, CA',
        lat: 34.1478,
        lng: -118.1445,
        description: 'Pasadena is known for the Rose Parade, Caltech, and being a suburb of Los Angeles.'
      },
      'bellevue': {
        name: 'Bellevue, WA',
        lat: 47.6104,
        lng: -122.2015,
        description: 'Bellevue is known for its corporate headquarters and being a suburb east of Seattle.'
      },
      'stamford': {
        name: 'Stamford, CT',
        lat: 41.0534,
        lng: -73.5387,
        description: 'Stamford is known for its corporate headquarters and being part of the New York metropolitan area.'
      },
      'new haven': {
        name: 'New Haven, CT',
        lat: 41.3083,
        lng: -72.9279,
        description: 'New Haven is known for Yale University and its pizza heritage.'
      },
      'thousand oaks': {
        name: 'Thousand Oaks, CA',
        lat: 34.1706,
        lng: -118.8376,
        description: 'Thousand Oaks is known for its suburban lifestyle and being part of the Conejo Valley.'
      },
      'warren': {
        name: 'Warren, MI',
        lat: 42.5145,
        lng: -83.0147,
        description: 'Warren is known for General Motors and being the largest suburb in Michigan.'
      },
      'huntington beach': {
        name: 'Huntington Beach, CA',
        lat: 33.6603,
        lng: -117.9992,
        description: 'Huntington Beach is known for its surfing culture and being part of Orange County.'
      },
      'deltona': {
        name: 'Deltona, FL',
        lat: 28.9005,
        lng: -81.2637,
        description: 'Deltona is known for its suburban development and being part of the Orlando metropolitan area.'
      },
      'vallejo': {
        name: 'Vallejo, CA',
        lat: 38.1041,
        lng: -122.2566,
        description: 'Vallejo is known for its historic buildings and being located in the San Francisco Bay Area.'
      },
      'berryville': {
        name: 'Berryville, AR',
        lat: 36.3648,
        lng: -93.5671,
        description: 'Berryville is a small town in the Ozark Mountains, known for its historic downtown and proximity to Beaver Lake.'
      },
      'abilene': {
        name: 'Abilene, TX',
        lat: 32.4487,
        lng: -99.7331,
        description: 'Abilene is known for Texas State Technical College and being located in West Texas.'
      },
      'akron': {
        name: 'Akron, OH',
        lat: 41.0814,
        lng: -81.5190,
        description: 'Akron is known for its rubber industry heritage and being home to the University of Akron.'
      },
      'alameda': {
        name: 'Alameda, CA',
        lat: 37.7652,
        lng: -122.2416,
        description: 'Alameda is known for its Victorian homes and being an island city in the San Francisco Bay Area.'
      },
      'albany ny': {
        name: 'Albany, NY',
        lat: 42.6526,
        lng: -73.7562,
        description: 'Albany is the capital of New York State, known for its historic architecture and government buildings.'
      },
      'albany ga': {
        name: 'Albany, GA',
        lat: 31.5785,
        lng: -84.1557,
        description: 'Albany is known for its role in the Civil Rights Movement and being located on the Flint River.'
      },
      'albuquerque nm': {
        name: 'Albuquerque, NM',
        lat: 35.0844,
        lng: -106.6504,
        description: 'Albuquerque is the largest city in New Mexico, known for its desert climate and proximity to natural wonders.'
      },
      'alexandria va': {
        name: 'Alexandria, VA',
        lat: 38.8048,
        lng: -77.0469,
        description: 'Alexandria is known for its historic district and being a suburb of Washington, D.C.'
      },
      'allen tx': {
        name: 'Allen, TX',
        lat: 33.1032,
        lng: -96.6706,
        description: 'Allen is known for its rapid growth and being a suburb north of Dallas.'
      },
      'amarillo tx': {
        name: 'Amarillo, TX',
        lat: 35.2072,
        lng: -101.8339,
        description: 'Amarillo is known for the Palo Duro Canyon and being located on the Texas Panhandle.'
      },
      'ames ia': {
        name: 'Ames, IA',
        lat: 42.0347,
        lng: -93.6201,
        description: 'Ames is known for Iowa State University and being located in central Iowa.'
      },
      'anaheim ca': {
        name: 'Anaheim, CA',
        lat: 33.8366,
        lng: -117.9143,
        description: 'Anaheim is known for Disneyland Resort and being part of Orange County.'
      },
      'anchorage ak': {
        name: 'Anchorage, AK',
        lat: 61.2181,
        lng: -149.9003,
        description: 'Anchorage is the largest city in Alaska, known for its wilderness access and being a major port.'
      },
      'anderson in': {
        name: 'Anderson, IN',
        lat: 40.1053,
        lng: -85.6803,
        description: 'Anderson is known for its manufacturing industry and being located in east central Indiana.'
      },
      'ann arbor': {
        name: 'Ann Arbor, MI',
        lat: 42.2808,
        lng: -83.7430,
        description: 'Ann Arbor is known for the University of Michigan and its vibrant cultural scene.'
      },
      'appleton wi': {
        name: 'Appleton, WI',
        lat: 44.2619,
        lng: -88.4154,
        description: 'Appleton is known for its paper industry heritage and being located on the Fox River.'
      },
      'arlington va': {
        name: 'Arlington, VA',
        lat: 38.8790,
        lng: -77.1068,
        description: 'Arlington is known for the Pentagon and Arlington National Cemetery.'
      },
      'arvada co': {
        name: 'Arvada, CO',
        lat: 39.8028,
        lng: -105.0875,
        description: 'Arvada is known for its mountain views and being a suburb of Denver.'
      },
      'asheville nc': {
        name: 'Asheville, NC',
        lat: 35.5951,
        lng: -82.5515,
        description: 'Asheville is known for its arts scene, Biltmore Estate, and being located in the Blue Ridge Mountains.'
      },
      'athens ga': {
        name: 'Athens, GA',
        lat: 33.9519,
        lng: -83.3576,
        description: 'Athens is known for the University of Georgia and its music scene.'
      },
      'augusta ga': {
        name: 'Augusta, GA',
        lat: 33.4735,
        lng: -82.0105,
        description: 'Augusta is known for the Masters golf tournament and being the second-largest city in Georgia.'
      },
      'augusta me': {
        name: 'Augusta, ME',
        lat: 44.3106,
        lng: -69.7795,
        description: 'Augusta is the capital of Maine, known for its location on the Kennebec River.'
      },
      'aurora il': {
        name: 'Aurora, IL',
        lat: 41.7606,
        lng: -88.3201,
        description: 'Aurora is known for its manufacturing industry and being a suburb west of Chicago.'
      },
      'austin mn': {
        name: 'Austin, MN',
        lat: 43.6680,
        lng: -92.9746,
        description: 'Austin is known for its meatpacking industry and being located in southeastern Minnesota.'
      },
      'bakersfield ca': {
        name: 'Bakersfield, CA',
        lat: 35.3733,
        lng: -119.0187,
        description: 'Bakersfield is known for its country music scene, oil industry, and being the largest city in the San Joaquin Valley.'
      },
      'baldwin park': {
        name: 'Baldwin Park, CA',
        lat: 34.0853,
        lng: -117.9609,
        description: 'Baldwin Park is known for its industrial parks and being located in the San Gabriel Valley.'
      },
      'baltimore md': {
        name: 'Baltimore, MD',
        lat: 39.2904,
        lng: -76.6122,
        description: 'Baltimore is known for its port, National Aquarium, and being home to Johns Hopkins University.'
      },
      'bartlett tn': {
        name: 'Bartlett, TN',
        lat: 35.2045,
        lng: -89.8730,
        description: 'Bartlett is known for its suburban development and being a suburb east of Memphis.'
      },
      'baton rouge': {
        name: 'Baton Rouge, LA',
        lat: 30.4515,
        lng: -91.1871,
        description: 'Baton Rouge is the capital of Louisiana, known for Louisiana State University and petrochemical industry.'
      },
      'baytown tx': {
        name: 'Baytown, TX',
        lat: 29.7355,
        lng: -94.9774,
        description: 'Baytown is known for its petrochemical refineries and being located near Houston.'
      },
      'beaumont tx': {
        name: 'Beaumont, TX',
        lat: 30.0802,
        lng: -94.1266,
        description: 'Beaumont is known for its port and lumber industry.'
      },
      'beaverton or': {
        name: 'Beaverton, OR',
        lat: 45.4871,
        lng: -122.8037,
        description: 'Beaverton is known for Nike headquarters and being a suburb west of Portland.'
      },
      'bedford tx': {
        name: 'Bedford, TX',
        lat: 32.8440,
        lng: -97.1431,
        description: 'Bedford is known for its suburban development and being part of the Dallas-Fort Worth area.'
      },
      'bel air md': {
        name: 'Bel Air, MD',
        lat: 39.5359,
        lng: -76.3488,
        description: 'Bel Air is known for its historic district and being located in northern Maryland.'
      },
      'bellingham wa': {
        name: 'Bellingham, WA',
        lat: 48.7519,
        lng: -122.4787,
        description: 'Bellingham is known for its proximity to Vancouver and being located near the Canadian border.'
      },
      'bentonville ar': {
        name: 'Bentonville, AR',
        lat: 36.3729,
        lng: -94.2088,
        description: 'Bentonville is known for Walmart headquarters and being located in the Ozark Mountains.'
      },
      'berkeley ca': {
        name: 'Berkeley, CA',
        lat: 37.8715,
        lng: -122.2730,
        description: 'Berkeley is known for the University of California, Berkeley and its progressive politics.'
      },
      'birmingham al': {
        name: 'Birmingham, AL',
        lat: 33.5186,
        lng: -86.8104,
        description: 'Birmingham is known for its role in the Civil Rights Movement and steel industry.'
      },
      'bismarck nd': {
        name: 'Bismarck, ND',
        lat: 46.8083,
        lng: -100.7837,
        description: 'Bismarck is the capital of North Dakota, known for its location on the Missouri River.'
      },
      'blaine mn': {
        name: 'Blaine, MN',
        lat: 45.1608,
        lng: -93.2349,
        description: 'Blaine is known for its suburban development and being a suburb north of Minneapolis.'
      },
      'bloomington in': {
        name: 'Bloomington, IN',
        lat: 39.1653,
        lng: -86.5264,
        description: 'Bloomington is known for Indiana University and being located in south central Indiana.'
      },
      'bloomington il': {
        name: 'Bloomington, IL',
        lat: 40.4842,
        lng: -88.9937,
        description: 'Bloomington is known for Illinois Wesleyan University and being located in central Illinois.'
      },
      'bloomington mn': {
        name: 'Bloomington, MN',
        lat: 44.8408,
        lng: -93.2983,
        description: 'Bloomington is known for the Mall of America and being a suburb south of Minneapolis.'
      },
      'boise id': {
        name: 'Boise, ID',
        lat: 43.6150,
        lng: -114.2271,
        description: 'Boise is the capital of Idaho, known for its outdoor recreation and being located in the Treasure Valley.'
      },
      'bonita springs': {
        name: 'Bonita Springs, FL',
        lat: 26.3398,
        lng: -81.7787,
        description: 'Bonita Springs is known for its golf courses and being located near Naples.'
      },
      'boone nc': {
        name: 'Boone, NC',
        lat: 36.2168,
        lng: -81.6746,
        description: 'Boone is known for Appalachian State University and being located in the Blue Ridge Mountains.'
      },
      'bossier city': {
        name: 'Bossier City, LA',
        lat: 32.5150,
        lng: -93.7321,
        description: 'Bossier City is known for its casinos and being located across the Red River from Shreveport.'
      },
      'bowling green': {
        name: 'Bowling Green, KY',
        lat: 36.9685,
        lng: -86.4808,
        description: 'Bowling Green is known for Western Kentucky University and its Corvette plant.'
      },
      'boynton beach': {
        name: 'Boynton Beach, FL',
        lat: 26.5318,
        lng: -80.0905,
        description: 'Boynton Beach is known for its beaches and being part of the Palm Beach metropolitan area.'
      },
      'bradenton fl': {
        name: 'Bradenton, FL',
        lat: 27.4989,
        lng: -82.5748,
        description: 'Bradenton is known for its arts scene and being located on the Gulf Coast.'
      },
      'brandon fl': {
        name: 'Brandon, FL',
        lat: 27.9378,
        lng: -82.2859,
        description: 'Brandon is known for its suburban development and being a suburb east of Tampa.'
      },
      'brentwood tn': {
        name: 'Brentwood, TN',
        lat: 36.0331,
        lng: -86.7828,
        description: 'Brentwood is known for its affluent suburbs and being located south of Nashville.'
      },
      'bridgeport ct': {
        name: 'Bridgeport, CT',
        lat: 41.1865,
        lng: -73.1952,
        description: 'Bridgeport is known for its port and being the largest city in Connecticut.'
      },
      'brighton co': {
        name: 'Brighton, CO',
        lat: 39.9853,
        lng: -104.8205,
        description: 'Brighton is known for its agricultural heritage and being located northeast of Denver.'
      },
      'broken arrow': {
        name: 'Broken Arrow, OK',
        lat: 36.0609,
        lng: -95.7975,
        description: 'Broken Arrow is known for its suburban development and being a suburb of Tulsa.'
      },
      'brooklyn park': {
        name: 'Brooklyn Park, MN',
        lat: 45.0941,
        lng: -93.3563,
        description: 'Brooklyn Park is known for its suburban development and being a suburb north of Minneapolis.'
      },
      'brownsville tx': {
        name: 'Brownsville, TX',
        lat: 25.9018,
        lng: -97.4975,
        description: 'Brownsville is known for its international trade and being located on the U.S.-Mexico border.'
      },
      'bryan tx': {
        name: 'Bryan, TX',
        lat: 30.6744,
        lng: -96.3690,
        description: 'Bryan is known for Texas A&M University and being located near College Station.'
      },
      'buckeye az': {
        name: 'Buckeye, AZ',
        lat: 33.3703,
        lng: -112.5838,
        description: 'Buckeye is known for its rapid growth and being located west of Phoenix.'
      },
      'buena park': {
        name: 'Buena Park, CA',
        lat: 33.8675,
        lng: -117.9981,
        description: 'Buena Park is known for Knott\'s Berry Farm and being part of Orange County.'
      },
      'buffalo grove': {
        name: 'Buffalo Grove, IL',
        lat: 42.1663,
        lng: -87.9631,
        description: 'Buffalo Grove is known for its suburban development and being located north of Chicago.'
      },
      'bullhead city': {
        name: 'Bullhead City, AZ',
        lat: 35.1478,
        lng: -114.5683,
        description: 'Bullhead City is known for its casinos and being located on the Colorado River.'
      },
      'burbank ca': {
        name: 'Burbank, CA',
        lat: 34.1808,
        lng: -118.3080,
        description: 'Burbank is known for Warner Bros. Studios and being located in the San Fernando Valley.'
      },
      'burien wa': {
        name: 'Burien, WA',
        lat: 47.4704,
        lng: -122.3468,
        description: 'Burien is known for its suburban development and being located south of Seattle.'
      },
      'burlington nc': {
        name: 'Burlington, NC',
        lat: 36.0957,
        lng: -79.4378,
        description: 'Burlington is known for its textile industry and being located in the Piedmont region.'
      },
      'burlington vt': {
        name: 'Burlington, VT',
        lat: 44.4759,
        lng: -73.2121,
        description: 'Burlington is known for the University of Vermont and being located on Lake Champlain.'
      },
      'burnsville mn': {
        name: 'Burnsville, MN',
        lat: 44.7677,
        lng: -93.2777,
        description: 'Burnsville is known for its suburban development and being a suburb south of Minneapolis.'
      },
      'camarillo ca': {
        name: 'Camarillo, CA',
        lat: 34.2164,
        lng: -119.0376,
        description: 'Camarillo is known for its agricultural industry and being located in Ventura County.'
      },
      'cape coral': {
        name: 'Cape Coral, FL',
        lat: 26.5629,
        lng: -81.9495,
        description: 'Cape Coral is known for its canals and being located on the Gulf Coast.'
      },
      'cape girardeau': {
        name: 'Cape Girardeau, MO',
        lat: 37.3059,
        lng: -89.5181,
        description: 'Cape Girardeau is known for Southeast Missouri State University and being located on the Mississippi River.'
      },
      'carlsbad ca': {
        name: 'Carlsbad, CA',
        lat: 33.1581,
        lng: -117.3506,
        description: 'Carlsbad is known for its beaches and being located in northern San Diego County.'
      },
      'carmel in': {
        name: 'Carmel, IN',
        lat: 39.9784,
        lng: -86.1180,
        description: 'Carmel is known for its affluent suburbs and being located north of Indianapolis.'
      },
      'carrollton tx': {
        name: 'Carrollton, TX',
        lat: 32.9756,
        lng: -96.8890,
        description: 'Carrollton is known for its suburban development and being part of the Dallas metropolitan area.'
      },
      'cary nc': {
        name: 'Cary, NC',
        lat: 35.7915,
        lng: -78.7811,
        description: 'Cary is known for its technology companies and being part of the Research Triangle.'
      },
      'cathedral city': {
        name: 'Cathedral City, CA',
        lat: 33.7805,
        lng: -116.4653,
        description: 'Cathedral City is known for its golf courses and being part of the Coachella Valley.'
      },
      'cedar park': {
        name: 'Cedar Park, TX',
        lat: 30.5052,
        lng: -97.8203,
        description: 'Cedar Park is known for its suburban development and being a suburb north of Austin.'
      },
      'cedar rapids': {
        name: 'Cedar Rapids, IA',
        lat: 41.9779,
        lng: -91.6656,
        description: 'Cedar Rapids is known for its insurance industry and being located on the Cedar River.'
      },
      'centennial co': {
        name: 'Centennial, CO',
        lat: 39.5807,
        lng: -104.8772,
        description: 'Centennial is known for its suburban development and being a suburb south of Denver.'
      },
      'champaign il': {
        name: 'Champaign, IL',
        lat: 40.1164,
        lng: -88.2434,
        description: 'Champaign is known for the University of Illinois and being located in east central Illinois.'
      },
      'chapel hill': {
        name: 'Chapel Hill, NC',
        lat: 35.9132,
        lng: -79.0558,
        description: 'Chapel Hill is known for the University of North Carolina and being part of the Research Triangle.'
      },
      'charleston sc': {
        name: 'Charleston, SC',
        lat: 32.7765,
        lng: -79.9311,
        description: 'Charleston is known for its historic architecture, port, and Southern cuisine.'
      },
      'charleston wv': {
        name: 'Charleston, WV',
        lat: 38.3498,
        lng: -81.6326,
        description: 'Charleston is the capital of West Virginia, known for being located on the Kanawha River.'
      },
      'charlottesville': {
        name: 'Charlottesville, VA',
        lat: 38.0293,
        lng: -78.4767,
        description: 'Charlottesville is known for the University of Virginia and Monticello.'
      },
      'chattanooga tn': {
        name: 'Chattanooga, TN',
        lat: 35.0456,
        lng: -85.3097,
        description: 'Chattanooga is known for its outdoor recreation and being located at the Tennessee-Georgia border.'
      },
      'chesapeake va': {
        name: 'Chesapeake, VA',
        lat: 36.7682,
        lng: -76.2875,
        description: 'Chesapeake is known for its military bases and being located in the Hampton Roads region.'
      },
      'cheyenne wy': {
        name: 'Cheyenne, WY',
        lat: 41.1400,
        lng: -104.8197,
        description: 'Cheyenne is the capital of Wyoming, known for its Western heritage and being located on the high plains.'
      },
      'chico ca': {
        name: 'Chico, CA',
        lat: 39.7285,
        lng: -121.8375,
        description: 'Chico is known for California State University, Chico and being located in the Sacramento Valley.'
      },
      'chino ca': {
        name: 'Chino, CA',
        lat: 34.0122,
        lng: -117.6889,
        description: 'Chino is known for its industrial parks and being located in San Bernardino County.'
      },
      'chino hills': {
        name: 'Chino Hills, CA',
        lat: 33.9898,
        lng: -117.7326,
        description: 'Chino Hills is known for its suburban development and being part of the Inland Empire.'
      },
      'christiansburg': {
        name: 'Christiansburg, VA',
        lat: 37.1298,
        lng: -80.4089,
        description: 'Christiansburg is known for its historic downtown and being located in the New River Valley.'
      },
      'cincinnati oh': {
        name: 'Cincinnati, OH',
        lat: 39.1031,
        lng: -84.5120,
        description: 'Cincinnati is known for its chili, baseball team, and being located at the confluence of the Ohio and Licking Rivers.'
      },
      'clarksville tn': {
        name: 'Clarksville, TN',
        lat: 36.5298,
        lng: -87.3595,
        description: 'Clarksville is known for Austin Peay State University and being located on the Cumberland River.'
      },
      'clearwater fl': {
        name: 'Clearwater, FL',
        lat: 27.9659,
        lng: -82.8001,
        description: 'Clearwater is known for its beaches and being located on the Gulf Coast.'
      },
      'cleveland oh': {
        name: 'Cleveland, OH',
        lat: 41.4993,
        lng: -81.6944,
        description: 'Cleveland is known for its Rock and Roll Hall of Fame, West Side Market, and Lake Erie location.'
      },
      'clovis ca': {
        name: 'Clovis, CA',
        lat: 36.8252,
        lng: -119.7029,
        description: 'Clovis is known for its suburban development and being a suburb north of Fresno.'
      },
      'college station': {
        name: 'College Station, TX',
        lat: 30.6270,
        lng: -96.3344,
        description: 'College Station is known for Texas A&M University and its research park.'
      },
      'columbia md': {
        name: 'Columbia, MD',
        lat: 39.2037,
        lng: -76.8610,
        description: 'Columbia is known for its planned community and being a suburb of Baltimore and Washington D.C.'
      },
      'columbia mo': {
        name: 'Columbia, MO',
        lat: 38.9517,
        lng: -92.3341,
        description: 'Columbia is known for the University of Missouri and being located in central Missouri.'
      },
      'columbia sc': {
        name: 'Columbia, SC',
        lat: 34.0007,
        lng: -81.0348,
        description: 'Columbia is the capital of South Carolina, known for the University of South Carolina.'
      },
      'columbus ga': {
        name: 'Columbus, GA',
        lat: 32.4610,
        lng: -84.9877,
        description: 'Columbus is known for Fort Benning and being located on the Chattahoochee River.'
      },
      'concord ca': {
        name: 'Concord, CA',
        lat: 37.9775,
        lng: -122.0311,
        description: 'Concord is known for its suburban development and being part of the San Francisco Bay Area.'
      },
      'concord nc': {
        name: 'Concord, NC',
        lat: 35.4088,
        lng: -80.5795,
        description: 'Concord is known for its manufacturing industry and being located in the Charlotte metropolitan area.'
      },
      'conroe tx': {
        name: 'Conroe, TX',
        lat: 30.3119,
        lng: -95.4561,
        description: 'Conroe is known for its suburban development and being located north of Houston.'
      },
      'conway ar': {
        name: 'Conway, AR',
        lat: 35.0887,
        lng: -92.4421,
        description: 'Conway is known for the University of Central Arkansas and being located in central Arkansas.'
      },
      'coon rapids': {
        name: 'Coon Rapids, MN',
        lat: 45.1732,
        lng: -93.3030,
        description: 'Coon Rapids is known for its suburban development and being a suburb north of Minneapolis.'
      },
      'coral gables': {
        name: 'Coral Gables, FL',
        lat: 25.7215,
        lng: -80.2684,
        description: 'Coral Gables is known for its Mediterranean architecture and being a suburb of Miami.'
      },
      'coral springs': {
        name: 'Coral Springs, FL',
        lat: 26.2712,
        lng: -80.2706,
        description: 'Coral Springs is known for its planned community and being part of the Miami metropolitan area.'
      },
      'corpus christi': {
        name: 'Corpus Christi, TX',
        lat: 27.8006,
        lng: -97.3964,
        description: 'Corpus Christi is known for its port, naval base, and beaches along the Gulf of Mexico.'
      },
      'costa mesa': {
        name: 'Costa Mesa, CA',
        lat: 33.6411,
        lng: -117.9187,
        description: 'Costa Mesa is known for South Coast Plaza and being part of Orange County.'
      },
      'cottage grove': {
        name: 'Cottage Grove, MN',
        lat: 44.8277,
        lng: -92.9438,
        description: 'Cottage Grove is known for its suburban development and being a suburb southeast of St. Paul.'
      },
      'covington ky': {
        name: 'Covington, KY',
        lat: 39.0837,
        lng: -84.5086,
        description: 'Covington is known for its historic district and being located across the Ohio River from Cincinnati.'
      },
      'cranston ri': {
        name: 'Cranston, RI',
        lat: 41.7798,
        lng: -71.4373,
        description: 'Cranston is known for its suburban development and being located in Providence County.'
      },
      'cypress ca': {
        name: 'Cypress, CA',
        lat: 33.8161,
        lng: -118.0373,
        description: 'Cypress is known for its suburban development and being part of Orange County.'
      },
      'dahlonega ga': {
        name: 'Dahlonega, GA',
        lat: 34.5326,
        lng: -83.9849,
        description: 'Dahlonega is known for its gold rush history and being located in the North Georgia mountains.'
      },
      'dallas tx': {
        name: 'Dallas, TX',
        lat: 32.7767,
        lng: -96.7970,
        description: 'Dallas is the ninth-most populous city in the United States, known for its role in the oil and cotton industries and modern skyline.'
      },
      'dalton ga': {
        name: 'Dalton, GA',
        lat: 34.7698,
        lng: -84.9702,
        description: 'Dalton is known for its carpet industry and being located in northwest Georgia.'
      },
      'danbury ct': {
        name: 'Danbury, CT',
        lat: 41.3948,
        lng: -73.4540,
        description: 'Danbury is known for its hat-making heritage and being located in Fairfield County.'
      },
      'danville va': {
        name: 'Danville, VA',
        lat: 36.5860,
        lng: -79.3950,
        description: 'Danville is known for its tobacco industry and being located on the Dan River.'
      },
      'davenport ia': {
        name: 'Davenport, IA',
        lat: 41.5236,
        lng: -90.5776,
        description: 'Davenport is known for its river location and being part of the Quad Cities metropolitan area.'
      },
      'davie fl': {
        name: 'Davie, FL',
        lat: 26.0765,
        lng: -80.2521,
        description: 'Davie is known for Nova Southeastern University and being a suburb of Fort Lauderdale.'
      },
      'dayton oh': {
        name: 'Dayton, OH',
        lat: 39.7589,
        lng: -84.1916,
        description: 'Dayton is known for its aviation history and being located in southwestern Ohio.'
      },
      'daytona beach': {
        name: 'Daytona Beach, FL',
        lat: 29.2108,
        lng: -81.0228,
        description: 'Daytona Beach is known for its beaches and NASCAR racing.'
      },
      'dearborn mi': {
        name: 'Dearborn, MI',
        lat: 42.3223,
        lng: -83.1763,
        description: 'Dearborn is known for the Ford Motor Company and being a suburb of Detroit.'
      },
      'decatur al': {
        name: 'Decatur, AL',
        lat: 34.6059,
        lng: -86.9833,
        description: 'Decatur is known for its industrial heritage and being located on the Tennessee River.'
      },
      'decatur il': {
        name: 'Decatur, IL',
        lat: 39.8403,
        lng: -88.9548,
        description: 'Decatur is known for Archer Daniels Midland and being located in central Illinois.'
      },
      'delaware oh': {
        name: 'Delaware, OH',
        lat: 40.2987,
        lng: -83.0677,
        description: 'Delaware is known for Ohio Wesleyan University and being located in central Ohio.'
      },
      'delray beach': {
        name: 'Delray Beach, FL',
        lat: 26.4615,
        lng: -80.0728,
        description: 'Delray Beach is known for its beaches and being part of the Palm Beach metropolitan area.'
      },
      'denton tx': {
        name: 'Denton, TX',
        lat: 33.2148,
        lng: -97.1331,
        description: 'Denton is known for the University of North Texas and being a suburb north of Dallas.'
      },
      'des moines': {
        name: 'Des Moines, IA',
        lat: 41.5868,
        lng: -93.6250,
        description: 'Des Moines is the capital of Iowa, known for its insurance industry and being located on the Des Moines River.'
      },
      'desoto tx': {
        name: 'DeSoto, TX',
        lat: 32.5897,
        lng: -96.8570,
        description: 'DeSoto is known for its suburban development and being a suburb south of Dallas.'
      },
      'deerfield beach': {
        name: 'Deerfield Beach, FL',
        lat: 26.3184,
        lng: -80.0998,
        description: 'Deerfield Beach is known for its beaches and being part of the South Florida metropolitan area.'
      }
    };

    // Check if query matches a known landmark with exact coordinates
    for (const [key, location] of Object.entries(landmarkCoordinates)) {
      if (cleanQuery.includes(key)) {
        console.log('Using exact coordinates for landmark:', key);
        return location;
      }
    }

    // Special handling for famous US landmarks to prevent wrong matches
    const landmarkMappings: { [key: string]: string } = {
      'grand canyon': 'Grand Canyon National Park, Arizona, USA',
      'statue of liberty': 'Statue of Liberty, New York, USA',
      'golden gate bridge': 'Golden Gate Bridge, San Francisco, California, USA',
      'mount rushmore': 'Mount Rushmore National Memorial, South Dakota, USA',
      'yellowstone': 'Yellowstone National Park, Wyoming, USA',
      'niagara falls': 'Niagara Falls, New York, USA',
      'disney world': 'Walt Disney World Resort, Orlando, Florida, USA',
      'las vegas': 'Las Vegas, Nevada, USA',
      'washington dc': 'Washington, District of Columbia, USA',
      'hollywood': 'Hollywood, Los Angeles, California, USA',
      'times square': 'Times Square, New York City, USA',
      'white house': 'White House, Washington DC, USA',
      'central park': 'Central Park, New York City, USA',
      'empire state building': 'Empire State Building, New York City, USA',
      'one world trade': 'One World Trade Center, New York City, USA'
    };

    // Check if query matches a known landmark
    let searchTerm = query;
    for (const [key, value] of Object.entries(landmarkMappings)) {
      if (cleanQuery.includes(key)) {
        searchTerm = value;
        console.log('Using landmark mapping:', key, '->', value);
        break;
      }
    }

    // Try OpenStreetMap with US-specific search first
    let result = await this.searchOpenStreetMap(searchTerm);

    // Fallback with more specific search terms if needed
    if (!result) {
      const usSpecificSearches = [
        `${searchTerm} USA`,
        `${searchTerm} United States`
      ];

      for (const search of usSpecificSearches) {
        result = await this.searchOpenStreetMap(search);
        if (result) {
          console.log('Found result with search term:', search);
          break;
        }
      }
    }

    return result;
  }
}
