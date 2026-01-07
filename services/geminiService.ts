
import { GoogleGenAI } from "@google/genai";
import { GenerationMode } from "../types";

/**
 * Base system instruction for consistent high-quality web output.
 */
const BASE_SYSTEM_PROMPT = `You are a world-class senior web developer and UI/UX designer. 
Your task is to create a COMPLETE standalone HTML5 file with embedded CSS and Vanilla JavaScript.
CRITICAL RULES:
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>.
- Use Google Fonts for professional typography.
- Ensure the site is fully mobile-responsive and accessible (ARIA roles).
- Include a sticky navbar, hero section, 3-4 feature/about sections, a contact form, and a footer.
- Use placeholder images from https://picsum.photos/ or professional SVGs.
- Output ONLY the raw HTML code starting with <!DOCTYPE html>. 
- DO NOT use markdown code blocks or provide preamble text.`;

/**
 * Optimized instructions per generation mode.
 */
const MODE_INSTRUCTIONS: Record<GenerationMode, string> = {
  [GenerationMode.NORMAL]: `${BASE_SYSTEM_PROMPT} Focus on modern, clean design and smooth CSS transitions.`,
  [GenerationMode.DEEP_THINK]: `${BASE_SYSTEM_PROMPT} 
    1. Analyze the user request for complex interaction requirements. 
    2. Architect a robust JavaScript state management if needed (vanilla). 
    3. Ensure advanced CSS layouts (Grid/Flex) and high-end animations.`,
  [GenerationMode.SEARCH]: `${BASE_SYSTEM_PROMPT} 
    Utilize the provided Google Search grounding to incorporate real-world data, current trends, and accurate information relevant to the user's specific industry or niche.`,
  [GenerationMode.FAST]: `${BASE_SYSTEM_PROMPT} Prioritize clean, lightweight code and fast-loading structures.`
};

export async function generateWebsiteCode(prompt: string, mode: GenerationMode): Promise<{ code: string; sources?: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let model = "gemini-3-flash-preview";
  let temperature = 0.6; // Creative default
  const config: any = {
    systemInstruction: MODE_INSTRUCTIONS[mode],
  };

  // Model & Config Optimization per Mode
  switch (mode) {
    case GenerationMode.DEEP_THINK:
      model = "gemini-3-pro-preview";
      temperature = 0.3; // More deterministic for complex code
      config.thinkingConfig = { thinkingBudget: 32768 };
      break;
    case GenerationMode.SEARCH:
      model = "gemini-3-flash-preview";
      config.tools = [{ googleSearch: {} }];
      break;
    case GenerationMode.FAST:
      model = "gemini-flash-lite-latest";
      temperature = 0.2; // Fast and simple
      break;
    default:
      model = "gemini-3-flash-preview";
      break;
  }

  config.temperature = temperature;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Build a production-ready website for: "${prompt}"`,
      config,
    });

    const text = response.text || '';
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    // Robust extraction: removes markdown wrappers and leading/trailing whitespace
    let code = text.trim();
    const markdownMatch = code.match(/^```(?:html)?\n([\s\S]*?)\n```$/);
    if (markdownMatch) {
      code = markdownMatch[1].trim();
    }
    
    // Ensure we actually got HTML
    if (!code.toLowerCase().includes('<!doctype') && !code.toLowerCase().includes('<html')) {
       // Fallback: If model missed the doctype but gave tags, wrap it or accept it
       console.warn("Model output did not include doctype, returning raw text.");
    }

    return { code, sources };
  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    throw new Error("Generation failed. This may be due to safety filters or API limits. Try a different prompt or mode.");
  }
}

export async function editImage(imageBuffer: string, prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBuffer.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: `Precisely modify this image as requested: "${prompt}". Focus on maintaining the original style and proportions.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image model failed to produce a valid edit.");
  } catch (error) {
    console.error("Image Processing Error:", error);
    throw new Error("Image edit failed. Please ensure the prompt is descriptive and follows safety guidelines.");
  }
}
