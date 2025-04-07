import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Initialize Firebase
try {
  initializeApp(firebaseConfig);
} catch (error) {
  console.log("Firebase already initialized or error initializing:", error);
}

const db = getFirestore();

// Initialize Gemini with the same API key used for trip generation
const apiKey = 'AIzaSyCNwMtA5ZvtaHYehqby13pna20DowRaQBc';
const genAI = new GoogleGenerativeAI(apiKey);

// Use the same model and configuration as in AiModal.js
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Export a pre-created chat session with history, exactly like in AiModal.js
export const locationDetailsChat = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {text: "Generate detailed information about Paris, France as a travel destination. Include a brief introduction, famous local dishes with descriptions, top places to visit with descriptions and visit durations, and estimated costs for a 7-day trip including accommodation options, food, transportation, and activities in JSON format\n"},
      ],
    },
    {
      role: "model",
      parts: [
        {text: `{
  "introduction": "Paris, the capital of France, is renowned as the 'City of Light' and one of the world's most beautiful and romantic destinations. With its iconic landmarks, world-class museums, charming neighborhoods, and exquisite cuisine, Paris offers visitors an unforgettable blend of history, culture, and beauty. The city is divided by the Seine River, with historic monuments dotting both banks. Paris's enchanting atmosphere comes alive through its elegant architecture, stylish boutiques, and vibrant street life, creating an ambiance that has inspired artists, writers, and dreamers for centuries.",
  "famous_dishes": [
    {
      "name": "Croissant",
      "description": "A flaky, buttery crescent-shaped pastry that's a staple of French breakfast. The perfect croissant is light and airy inside with a crisp, golden exterior."
    },
    {
      "name": "Boeuf Bourguignon",
      "description": "A classic French beef stew slow-cooked with red wine, mushrooms, pearl onions, and bacon. This hearty dish represents traditional French country cooking at its finest."
    },
    {
      "name": "Coq au Vin",
      "description": "Chicken braised with wine, lardons, mushrooms, and garlic. This rustic dish transforms simple ingredients into a rich and satisfying meal."
    },
    {
      "name": "Escargots de Bourgogne",
      "description": "Snails baked in their shells with parsley butter and garlic, a distinctive French delicacy that's worth trying at least once."
    },
    {
      "name": "Macarons",
      "description": "Delicate meringue-based sandwich cookies with ganache, buttercream, or jam filling. Available in countless flavors and colors, they're as beautiful as they are delicious."
    }
  ],
  "places_to_visit": [
    {
      "name": "Eiffel Tower",
      "description": "The iconic symbol of Paris offers stunning panoramic views of the city from its observation decks.",
      "visit_duration": "2-3 hours"
    },
    {
      "name": "Louvre Museum",
      "description": "The world's largest art museum, home to thousands of works including the Mona Lisa and Venus de Milo.",
      "visit_duration": "Half day to full day"
    },
    {
      "name": "Notre-Dame Cathedral",
      "description": "A masterpiece of French Gothic architecture dating back to the 12th century (note: interior visits are limited due to restoration work following the 2019 fire).",
      "visit_duration": "1-2 hours"
    },
    {
      "name": "Montmartre and Sacré-Cœur",
      "description": "A historic hilltop district crowned by the white-domed Sacré-Cœur Basilica, offering beautiful views and a bohemian atmosphere.",
      "visit_duration": "3-4 hours"
    },
    {
      "name": "Champs-Élysées and Arc de Triomphe",
      "description": "The famous boulevard lined with shops and restaurants, leading to the monumental arch commemorating Napoleon's victories.",
      "visit_duration": "2-3 hours"
    },
    {
      "name": "Musée d'Orsay",
      "description": "Housed in a former railway station, this museum features an impressive collection of Impressionist and Post-Impressionist masterpieces.",
      "visit_duration": "3-4 hours"
    },
    {
      "name": "Seine River Cruise",
      "description": "A relaxing boat tour offering unique perspectives of many Parisian landmarks from the water.",
      "visit_duration": "1 hour"
    },
    {
      "name": "Palace of Versailles",
      "description": "The opulent royal residence located just outside Paris, featuring lavish apartments and magnificent gardens.",
      "visit_duration": "Full day"
    }
  ],
  "cost_estimates": {
    "accommodation": {
      "budget": "€70-120 per night",
      "mid_range": "€150-250 per night",
      "luxury": "€300+ per night"
    },
    "food_per_day": "€30-60 per person",
    "local_transportation": "€25-40 for a weekly pass",
    "sightseeing_activities": "€100-200 total",
    "total_estimate": "€1000-2500 for 7 days (excluding flights)"
  }
}`},
      ],
    },
  ],
});

/**
 * Check if location data exists in Firebase
 * @param {string} locationName - The name of the location
 * @param {string} countryName - The country where the location is situated
 * @returns {Promise<Object|null>} - Location data from Firebase or null if not found
 */
const getLocationFromFirebase = async (locationName, countryName) => {
  try {
    const locationId = `${locationName.toLowerCase()}_${countryName ? countryName.toLowerCase() : 'unknown'}`;
    const docRef = doc(db, "locationDetails", locationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("Location data found in Firebase");
      return { ...docSnap.data(), fromCache: true };
    } else {
      console.log("No location data in Firebase");
      return null;
    }
  } catch (error) {
    console.error("Error fetching location from Firebase:", error);
    return null;
  }
};

/**
 * Save location data to Firebase
 * @param {string} locationName - The name of the location
 * @param {string} countryName - The country where the location is situated
 * @param {Object} data - The location data to save
 */
const saveLocationToFirebase = async (locationName, countryName, data) => {
  try {
    const locationId = `${locationName.toLowerCase()}_${countryName ? countryName.toLowerCase() : 'unknown'}`;
    const docRef = doc(db, "locationDetails", locationId);
    
    // Add timestamp to the data
    const dataWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString(),
      locationName,
      countryName
    };
    
    await setDoc(docRef, dataWithTimestamp);
    console.log("Location data saved to Firebase");
  } catch (error) {
    console.error("Error saving location to Firebase:", error);
  }
};

/**
 * Get location details using the chat session implementation
 * @param {string} locationName - The name of the location
 * @param {string} countryName - The country where the location is situated
 * @returns {Promise<Object>} - Location details from chat session
 */
export const getLocationDetails = async (locationName, countryName) => {
  try {
    const result = await locationDetailsChat.sendMessage(`Generate detailed information about ${locationName}, ${countryName} as a travel destination. Include a brief introduction, famous local dishes with descriptions, top places to visit with descriptions and visit durations, and estimated costs for a 7-day trip including accommodation options, food, transportation, and activities in JSON format`);
    
    const responseText = result.response.text();
    
    // Try to parse as JSON directly first
    try {
      return JSON.parse(responseText);
    } catch (err) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                        responseText.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error("Failed to extract JSON from response");
      }
    }
  } catch (error) {
    console.error("Error getting location details:", error);
    throw error;
  }
}; 