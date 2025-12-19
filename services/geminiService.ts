
import { GoogleGenAI } from "@google/genai";
import { Unit, VisitData } from '../types';

/**
 * Generates a luxurious real estate description for a specific unit using Gemini AI.
 */
export const generateUnitDescription = async (unit: Unit): Promise<string> => {
  try {
    // Create a new GoogleGenAI instance right before making an API call to ensure current credentials
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a luxurious, captivating real estate description (max 50 words) for a ${unit.type} apartment located on floor ${unit.floor} of Tower ${unit.tower}. The size is ${unit.sqft} sqft. Focus on lifestyle and prestige.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Experience luxury living at its finest.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Experience luxury living at its finest in this premium unit.";
  }
};

/**
 * Analyzes visitor tour data and generates strategic sales insights using Gemini AI.
 */
export const generateAnalyticsInsight = async (data: VisitData[]): Promise<string> => {
  try {
    // Create a new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const dataString = JSON.stringify(data);
    const prompt = `Analyze this visitor data for a virtual home tour: ${dataString}. Provide a 1-sentence strategic insight for the sales team about what buyers are most interested in.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Buyers seem most interested in the living areas.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "High engagement detected in main living areas.";
  }
};
