import type { Location } from '../types';
import { SearchService } from './searchService';

export class GeneralAIService {
  private apiKey: string = process.env.REACT_APP_AI_API_KEY || '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';
  private apiUrl: string = process.env.REACT_APP_AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
  private searchService: SearchService = new SearchService();

  private async callOpenAI(question: string): Promise<{ answer: string; location?: Location } | null> {
    if (!this.apiKey) {
      console.warn('No OpenAI API key found');
      return null;
    }

    console.log('Calling OpenAI with question:', question);

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI assistant specializing in comprehensive knowledge about the United States of America. You have extensive knowledge across all aspects of American life, culture, history, geography, government, society, economy, and current events.

## YOUR KNOWLEDGE DOMAINS:

### � **GLOBAL KNOWLEDGE**
- **World Geography**: Countries, capitals, continents, landmarks, cultures
- **History**: Ancient civilizations, world wars, modern history, inventions
- **Science & Technology**: Physics, biology, computers, space exploration
- **Arts & Culture**: Music, literature, film, art from around the world
- **Current Events**: Global news, politics, economics, sports

### �️ **AMERICAN HISTORY**
- **Colonial Period**: Jamestown (1607), Plymouth (1620), 13 colonies, colonial life, Salem witch trials
- **Revolutionary Era**: Declaration of Independence (1776), American Revolution (1775-1783), Constitutional Convention (1787), Federalist Papers
- **Early Republic**: George Washington, Thomas Jefferson, John Adams, Louisiana Purchase (1803), War of 1812
- **Civil War Era**: Abraham Lincoln, slavery, abolition, Union vs Confederacy, Gettysburg, Emancipation Proclamation
- **Industrial Revolution**: Westward expansion, railroads, immigration waves, urbanization
- **World Wars**: World War I (1917-1918), World War II (1941-1945), D-Day, atomic bombs
- **Civil Rights Movement**: Martin Luther King Jr., Rosa Parks, Malcolm X, March on Washington (1963), Civil Rights Act (1964), Voting Rights Act (1965)
- **Modern Era**: Vietnam War, Watergate, 9/11 attacks, Iraq War, Afghanistan War, Obama presidency, recent elections
- **Key Figures**: All US presidents, Supreme Court justices, civil rights leaders, inventors, explorers

### 🎨 **AMERICAN CULTURE & SOCIETY**
- **Traditions & Holidays**: Thanksgiving, Christmas, Independence Day (July 4th), Halloween, Super Bowl, Macy's Thanksgiving Parade
- **Food & Cuisine**: American classics (hamburger, hot dog, apple pie), regional specialties (Southern BBQ, New England clam chowder, California sushi), Thanksgiving turkey, hot dogs at baseball games
- **Sports Culture**: NFL, NBA, MLB, NHL, college football, March Madness, Olympics, Super Bowl parties
- **Entertainment**: Hollywood film industry, Broadway theater, music genres (jazz, blues, rock, hip-hop, country), TV shows, streaming services
- **Literature**: Mark Twain, Ernest Hemingway, F. Scott Fitzgerald, Toni Morrison, John Steinbeck, modern authors
- **Art & Music**: Jazz Age, Harlem Renaissance, modern art, country music, rap/hip-hop, rock 'n' roll
- **Popular Culture**: Comic books, video games, social media, influencers, memes, viral trends

### 🗺️ **GEOGRAPHY & LANDMARKS**
- **States & Capitals**: All 50 states, their capitals, nicknames, major cities
- **National Parks**: Yellowstone, Grand Canyon, Yosemite, Zion, Great Smoky Mountains, Everglades
- **Major Cities**: New York City, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, San Jose
- **Landmarks**: Statue of Liberty, Golden Gate Bridge, Mount Rushmore, Washington Monument, Space Needle, Gateway Arch
- **Natural Wonders**: Niagara Falls, Grand Canyon, Yellowstone geysers, Great Lakes, Mississippi River, Rocky Mountains
- **Regions**: Northeast, South, Midwest, Southwest, West Coast, Hawaii, Alaska

### 🏛️ **GOVERNMENT & POLITICS**
- **Constitution**: Three branches (Executive, Legislative, Judicial), Bill of Rights, amendments
- **Federal Government**: White House, Congress (House & Senate), Supreme Court, federal agencies
- **Political Parties**: Democrats, Republicans, third parties, primaries, elections
- **State Governments**: State constitutions, governors, state legislatures
- **Local Government**: Mayors, city councils, county commissioners
- **Current Events**: Recent news, Supreme Court decisions, congressional actions, presidential policies

### 💰 **ECONOMY & BUSINESS**
- **Major Industries**: Technology (Silicon Valley), finance (Wall Street), agriculture, manufacturing, entertainment
- **Fortune 500 Companies**: Apple, Amazon, Microsoft, Google, Walmart, ExxonMobil
- **Stock Market**: NYSE, NASDAQ, S&P 500, Dow Jones
- **Economic History**: Great Depression, New Deal, post-WWII boom, dot-com bubble, 2008 financial crisis
- **Labor Movement**: Unions, minimum wage, workers' rights, strikes

### 👥 **AMERICAN SOCIETY**
- **Demographics**: Population diversity, immigration patterns, ethnic groups, age distribution
- **Education**: Public schools, universities (Harvard, Yale, Stanford), community colleges
- **Healthcare**: Public health system, private insurance, Medicare/Medicaid
- **Religion**: Freedom of religion, major denominations, secularism
- **Social Issues**: Gender equality, LGBTQ+ rights, racial justice, climate change, gun control, healthcare reform
- **Military**: Armed forces, veterans, military history, defense spending

### 🎓 **SCIENCE & INNOVATION**
- **Inventions**: Light bulb (Edison), telephone (Bell), airplane (Wright brothers), internet, space program
- **Space Exploration**: NASA, Apollo moon landings, Space Shuttle, International Space Station
- **Medical Advances**: Polio vaccine, heart transplant, COVID-19 vaccines, medical research
- **Technology**: Computer revolution, smartphones, social media, AI development

### 🎭 **ARTS & ENTERTAINMENT**
- **Film Industry**: Hollywood studios, Academy Awards, blockbuster movies, independent films
- **Music Scene**: Jazz (Louis Armstrong, Duke Ellington), blues (B.B. King), rock (Elvis Presley, Beatles influence), hip-hop (rap, R&B)
- **TV & Streaming**: Sitcoms, dramas, reality TV, Netflix, streaming revolution
- **Literature**: American authors from all eras, Pulitzer Prize winners, bestsellers
- **Theater**: Broadway shows, off-Broadway, regional theater, Tony Awards

## BEHAVIOR RULES

1. **LOCATION REQUESTS**
   [Official Name] is located at [Latitude], [Longitude]. [Description].

2. **GENERAL QUESTIONS ABOUT THE UNITED STATES**
   If the user asks about American culture, traditions, food, history, government, society, economy, current events, or ANY aspect of American life, respond normally with a clear, informative, and engaging answer in plain text.

3. **MULTIPLE LOCATIONS**
   If the user asks about several U.S. places, return the most relevant single location.

4. **NON-US QUESTIONS**
   Answer questions about any topic normally with a clear and informative answer in plain text.

5. **OUTPUT VALIDITY**
   * JSON responses must always be valid.
   * Never mix JSON with additional text.
   * Only use JSON for location responses.

6. **PERSONALITY**
   Be enthusiastic, knowledgeable, and engaging when answering questions about America. Show pride in American achievements while being balanced and factual.`
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 150, // Further reduced for speed
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('API Response Data:', data);

      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const answer = data.choices[0].message.content;
        console.log('AI Answer:', answer);

        // Extract location from the AI response
        const locationName = this.extractLocationFromText(answer);
        console.log('Extracted location:', locationName);

        let location: Location | undefined;

        if (locationName) {
          const locResult = await this.searchService.searchLocation(locationName);
          if (locResult) {
            location = locResult;
            console.log('Found location:', location);
          }
        }

        return { answer, location };
      }

      console.error('No choices in AI response');
      return null;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return null;
    }
  }

  private extractLocationFromText(text: string): string | null {
    // Enhanced location patterns with more common sense for natural language
    const locationPatterns = [
      // Presidents and their homes/locations
      { pattern: /first president|george washington|washington's home|mount vernon/gi, location: "Mount Vernon" },
      { pattern: /white house|president's home|where president lives|oval office/gi, location: "White House" },
      { pattern: /current president|president biden|joe biden/gi, location: "White House" },

      // Capitals and government
      { pattern: /capital.*united states|washington dc|washington d\.c\.|dc|nation's capital/gi, location: "Washington DC" },
      { pattern: /capital.*[a-z]{2}|state capital/gi, location: null }, // Will be handled separately

      // Cities and states - more natural language patterns
      { pattern: /new york|nyc|big apple|new york city|go to new york/gi, location: "New York City" },
      { pattern: /los angeles|la|city of angels|los angeles california|go to la/gi, location: "Los Angeles" },
      { pattern: /chicago|windy city|chicago illinois|go to chicago/gi, location: "Chicago" },
      { pattern: /houston|space city|houston texas|go to houston/gi, location: "Houston" },
      { pattern: /phoenix|valley of the sun|phoenix arizona|go to phoenix/gi, location: "Phoenix" },
      { pattern: /philadelphia|philly|city of brotherly love|go to philadelphia/gi, location: "Philadelphia" },
      { pattern: /san antonio|san antone|go to san antonio/gi, location: "San Antonio" },
      { pattern: /san diego|america's finest city|go to san diego/gi, location: "San Diego" },
      { pattern: /dallas|big d|go to dallas/gi, location: "Dallas" },
      { pattern: /san jose|san jo|go to san jose/gi, location: "San Jose" },

      // Famous landmarks - more conversational patterns
      { pattern: /statue of liberty|lady liberty|statue liberty|freedom statue/gi, location: "Statue of Liberty" },
      { pattern: /golden gate bridge|golden gate|sf bridge|san francisco bridge/gi, location: "Golden Gate Bridge" },
      { pattern: /grand canyon|arizona canyon|colorado canyon/gi, location: "Grand Canyon" },
      { pattern: /mount rushmore|rushmore|president mountain|south dakota monument/gi, location: "Mount Rushmore" },
      { pattern: /yellowstone|old faithful|yellowstone park|geyser park/gi, location: "Yellowstone National Park" },
      { pattern: /niagara falls|niagara|waterfall new york/gi, location: "Niagara Falls" },
      { pattern: /disney world|walt disney world|orlando disney|florida disney/gi, location: "Walt Disney World" },
      { pattern: /disneyland|disney land|california disney|anaheim disney/gi, location: "Disneyland" },
      { pattern: /las vegas|vegas|sin city|nevada casinos/gi, location: "Las Vegas" },
      { pattern: /hollywood|movie land|film industry|celebrity town/gi, location: "Hollywood" },
      { pattern: /times square|new york square|nyc square/gi, location: "Times Square" },
      { pattern: /central park|nyc park|new york park/gi, location: "Central Park" },
      { pattern: /empire state building|empire state|nyc skyscraper/gi, location: "Empire State Building" },
      { pattern: /one world trade|freedom tower|world trade center/gi, location: "One World Trade Center" },
      
      // Borders and international boundaries
      { pattern: /us canada border|canada border|usa canada border|us-canada border/gi, location: "US-Canada Border" },
      { pattern: /northern border|usa northern border|united states northern border/gi, location: "US-Canada Border" },
      { pattern: /nearest border.*canada|border.*canada|border with canada/gi, location: "US-Canada Border" },
      { pattern: /us mexico border|mexico border|usa mexico border|us-mexico border/gi, location: "US-Mexico Border" },
      { pattern: /southern border|usa southern border|united states southern border/gi, location: "US-Mexico Border" },
      { pattern: /nearest border.*mexico|border.*mexico|border with mexico/gi, location: "US-Mexico Border" },
      
      // Natural features
      { pattern: /mount everest|everest|highest mountain/gi, location: "Mount Everest" },
      { pattern: /mississippi river|mississippi|longest river/gi, location: "Mississippi River" },
      { pattern: /colorado river|colorado|grand canyon river/gi, location: "Colorado River" },
      { pattern: /rocky mountains|rockies|mountain range/gi, location: "Rocky Mountains" },
      { pattern: /great lakes|lake superior|lake michigan|lake huron|lake erie|lake ontario/gi, location: "Great Lakes" },
      { pattern: /mohave desert|mojave desert|california desert/gi, location: "Mojave Desert" },
      { pattern: /death valley|california valley|desert valley/gi, location: "Death Valley" }
    ];

    // Check specific patterns first
    for (const { pattern, location } of locationPatterns) {
      if (location !== null && pattern.test(text)) {
        pattern.lastIndex = 0; // Reset regex
        return location;
      }
    }

    // General location patterns for natural language
    const generalPatterns = [
      /show me (.+?)\b/i,
      /take me to (.+?)\b/i,
      /where is (.+?)\b/i,
      /find (.+?)\b/i,
      /locate (.+?)\b/i,
      /how do i get to (.+?)\b/i,
      /directions to (.+?)\b/i,
      /navigate to (.+?)\b/i,
      /in ([A-Z][a-z\s]+(?:City|Park|Mountain|Bridge|Monument|Building|Museum|Airport|State|Country))/gi,
      /at ([A-Z][a-z\s]+(?:City|Park|Mountain|Bridge|Monument|Building|Museum|Airport))/gi,
      /([A-Z][a-z\s]+(?:City|Park|Mountain|Bridge|Monument|Building|Museum|Airport))/gi,
      /(New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose)/gi,
      /(California|Texas|Florida|New York|Pennsylvania|Illinois|Ohio|Georgia|North Carolina)/gi,
      /(Washington DC|Washington D\.C\.|DC)/gi,
      /(Grand Canyon|Yellowstone|Mount Rushmore|Statue of Liberty|Golden Gate Bridge|Niagara Falls)/gi
    ];

    for (const pattern of generalPatterns) {
      const matches = text.match(pattern);

      if (matches && matches[1]) {
        return matches[1].trim();
      } else if (matches && matches[0]) {
        return matches[0].trim();
      }
    }

    return null;
  }

  async answerQuestion(question: string): Promise<{ answer: string; location?: Location }> {
    console.log('=== Answering question:', question);

    // FIRST PRIORITY: Check for hardcoded landmark coordinates from user question directly
    let locationResult = await this.searchService.searchLocation(question);

    // SECOND PRIORITY: Extract location from user question text using regex patterns
    if (!locationResult) {
      const extractedLocation = this.extractLocationFromText(question);
      if (extractedLocation) {
        console.log('=== EXTRACTED LOCATION FROM QUESTION:', extractedLocation);
        locationResult = await this.searchService.searchLocation(extractedLocation);
        if (locationResult) {
          console.log('=== FOUND LOCATION FROM EXTRACTION:', locationResult);
        }
      }
    }

    // If we found a location, get AI response and return both
    if (locationResult) {
      console.log('=== FOUND LOCATION:', locationResult);
      console.log('Coordinates:', locationResult.lat, ',', locationResult.lng);

      // Get AI response for description
      const aiResponse = await this.callOpenAI(question);

      if (aiResponse && aiResponse.answer && !aiResponse.answer.includes('error') && !aiResponse.answer.includes('{"error"')) {
        console.log('=== USING AI DESCRIPTION ===');
        return {
          answer: aiResponse.answer,
          location: locationResult // Always use our hardcoded coordinates
        };
      } else {
        // Use search service description if AI fails
        console.log('=== USING SEARCH SERVICE DESCRIPTION ===');
        return {
          answer: `Here's information about ${locationResult.name}: ${locationResult.description}`,
          location: locationResult
        };
      }
    }

    // THIRD PRIORITY: General questions without locations
    const aiResponse = await this.callOpenAI(question);
    if (aiResponse) {
      return aiResponse;
    }

    // ULTIMATE FALLBACK
    return {
      answer: "I'm sorry, I couldn't process your question. Please try asking about a location or topic in the United States."
    };
  }
}
