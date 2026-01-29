import { GoogleGenAI, Type } from "@google/genai";
import { Category } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface NubankRawItem {
  date: string;
  description: string;
  amount: number;
}

interface CategorizedItem {
  description: string;
  category: string;
}

export const categorizeTransactionsWithGemini = async (transactions: NubankRawItem[]): Promise<Map<string, Category>> => {
  try {
    // We only send descriptions to the model to save tokens and privacy
    const descriptions = transactions.map(t => t.description);
    
    // Deduplicate descriptions to minimize API load
    const uniqueDescriptions = Array.from(new Set(descriptions));

    const prompt = `
      Você é um assistente financeiro inteligente. 
      Classifique as seguintes descrições de transações bancárias em uma destas categorias exatas:
      ${Object.values(Category).join(', ')}.
      
      Se não tiver certeza, use "Outros".
      Retorne APENAS um JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}\n\nDescrições: ${JSON.stringify(uniqueDescriptions)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              category: { type: Type.STRING } // We will cast this to enum later
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) return new Map();

    const parsed: CategorizedItem[] = JSON.parse(resultText);
    
    const categoryMap = new Map<string, Category>();
    
    parsed.forEach(item => {
      // Validate that the returned category is actually in our enum
      const validCategory = Object.values(Category).includes(item.category as Category)
        ? (item.category as Category)
        : Category.OUTROS;
        
      categoryMap.set(item.description, validCategory);
    });

    return categoryMap;

  } catch (error) {
    console.error("Error categorizing with Gemini:", error);
    return new Map(); // Fallback to empty map (user will manually categorize or default to Other)
  }
};