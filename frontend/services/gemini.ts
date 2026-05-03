
import { GoogleGenAI } from "@google/genai";

export const refinePurpose = async (category: string, rawPurpose: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a formal academic assistant. A student wants to apply for ${category}. 
      Their raw reason is: "${rawPurpose}". 
      Rewrite this into a concise, professional, and formal purpose statement (max 2 sentences) suitable for a college leave application. 
      Only return the refined text, nothing else.`,
    });
    return response.text || rawPurpose;
  } catch (error) {
    console.error("AI refinement failed:", error);
    return rawPurpose;
  }
};
