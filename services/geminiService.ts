import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";

// --- CLIENT FACTORIES ---

const getOpenAIClient = () => {
  const apiKey = process.env.API_KEY_OPENAI;
  if (!apiKey) return null;
  
  return new OpenAI({ 
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// --- CORE FUNCTIONS ---

export const breakDownTaskAI = async (taskTitle: string): Promise<string[]> => {
  // 1. Try OpenAI First
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful productivity assistant. You break down tasks into 3-5 very small, actionable sub-tasks (under 15 mins each). Return ONLY a JSON array of strings. Do not include markdown formatting like ```json." 
          },
          { 
            role: "user", 
            content: `Break down the task "${taskTitle}".` 
          }
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      if (!content) return [];

      // Clean cleanup in case GPT adds markdown code blocks despite instructions
      const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedContent);

    } catch (error) {
      console.error("OpenAI Error:", error);
      // Fall through to Gemini or fallback
    }
  }

  // 2. Fallback to Gemini
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Break down the task "${taskTitle}" into 3 to 5 very small, actionable sub-tasks that take less than 15 minutes each. Keep them concise and motivating.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Gemini Error:", error);
    }
  }

  // 3. Final Fallback (Offline/No Keys)
  return [
    "Paso 1: Preparar materiales (5 min)",
    "Paso 2: Ejecutar la parte principal (10 min)",
    "Paso 3: Revisar y finalizar (5 min)"
  ];
};

export const getMotivationalQuote = async (): Promise<string> => {
    // 1. Try OpenAI First
    const openai = getOpenAIClient();
    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a motivational coach for people with ADHD." },
                    { role: "user", content: "Give me a very short (max 10 words), punchy motivational quote." }
                ],
                max_tokens: 50,
            });
            return completion.choices[0].message.content || "¡Tú puedes!";
        } catch (e) {
            console.error("OpenAI Quote Error", e);
        }
    }

    // 2. Fallback to Gemini
    const ai = getGeminiClient();
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Give me a very short (max 10 words), punchy motivational quote for someone with ADHD trying to focus.",
            });
            return response.text || "¡Tú puedes!";
        } catch (e) {
            return "Sigue adelante.";
        }
    }

    // 3. Final Fallback
    return "Un paso a la vez.";
}