import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT =
  "You are a biodiversity chatbot. Only answer questions about animal and plant species. If a user asks about anything else, politely decline and remind them you only answer species-related questions.";

export async function generateResponse(message: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return response.text ?? "No response generated.";
  } catch (error) {
    console.error("Gemini API request failed:", error);
    return "I had trouble retrieving information. Please try again.";
  }
}
