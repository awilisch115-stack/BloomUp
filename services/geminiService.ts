
import { GoogleGenAI, Type } from "@google/genai";
import { StylePreset, ShoppingSuggestion, ImplementationStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const redesignRoom = async (
  base64Image: string,
  style: StylePreset
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  // High-fidelity prompt optimization for landscape transformation
  const prompt = `Act as an elite landscape architect and high-end architectural photographer. 
  
  TASK: Perform a complete botanical and structural "BloomUp" synthesis on the attached photo.
  
  ARCHITECTURAL PROTOCOL:
  1. FOUNDATION: Keep the house, main buildings, and permanent structures exactly in their current position. Do not warp or alter the main architecture.
  2. TURF SYNTHESIS: Replace all dead, patchy, or yellow grass with a hyper-realistic, dense, and perfectly edged emerald-green lawn. It should have visible texture, soft shadows, and a uniform professional cut.
  3. BOTANICAL OVERHAUL: Replace messy or overgrown weeds with curated, healthy specimen plants, ornamental grasses, and lush flowering perennials. Ensure plants look hydrated and vibrant.
  4. SURFACE RENOVATION: Digitally restore all hardscapes. Concrete paths should become clean limestone or slate pavers; old wood should look like freshly oiled Ipe or Teak decking. Add sharp local contrast to stone textures.
  5. CINEMATIC LIGHTING: Render the entire scene during "Golden Hour." Add long, soft, warm shadows and a gentle lens flare. Highlights should glisten off healthy waxy leaves and clean water features (if present).
  6. CLEANLINESS: Systematically remove all clutter, trash, loose hoses, or unsightly debris from the frame.
  
  STYLE SPECIFIC INSTRUCTIONS:
  AESTHETIC: "${style.name}"
  EXECUTION: ${style.description}. Integrate these specific design elements seamlessly into the existing layout.
  
  OUTPUT QUALITY: The result must look like a professional $100k landscape renovation shot for an international design magazine. High dynamic range, sharp edges, and zero AI artifacts.
  
  Return ONLY the final processed image.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1] || base64Image,
            mimeType: 'image/jpeg',
          },
        },
        { text: prompt },
      ],
    },
  });

  const candidates = response.candidates || [];
  if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("The synthesis engine failed to produce a valid image. Please refine your style selection and try again.");
};

export const getDetailedPlan = async (
  style: StylePreset
): Promise<{ inventory: ShoppingSuggestion[], guide: ImplementationStep[], maintenanceChecklist: string[] }> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Generate a comprehensive professional maintenance and implementation plan for a yard restoration in the "${style.name}" style.
  
  Requirements:
  1. A list of 6 premium maintenance materials/products (e.g., organic fertilizers, specific mulches, high-end tools) with professional descriptions and price ranges ($ to $$$).
  2. A 4-phase step-by-step implementation guide (Clearing, Preparation, Installation, Refinement).
  3. A specific "Maintenance Checklist" of 8-10 professional-grade bullet points for long-term botanical health.
  
  Return the data in a strict JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          inventory: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                description: { type: Type.STRING },
                priceRange: { type: Type.STRING },
              },
              required: ["item", "description", "priceRange"]
            }
          },
          guide: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                title: { type: Type.STRING },
                actions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["phase", "title", "actions"]
            }
          },
          maintenanceChecklist: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["inventory", "guide", "maintenanceChecklist"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{}';
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      inventory: parsed.inventory || [],
      guide: parsed.guide || [],
      maintenanceChecklist: parsed.maintenanceChecklist || []
    };
  } catch (e) {
    console.error("Failed to parse plan JSON", e);
    return { inventory: [], guide: [], maintenanceChecklist: [] };
  }
};

export interface StoreResult {
  title: string;
  uri: string;
}

export const searchNearbyStores = async (
  items: string[],
  location: { latitude: number; longitude: number }
): Promise<StoreResult[]> => {
  const model = 'gemini-2.5-flash';
  const itemNames = items.join(", ");
  const prompt = `Identify top-tier professional landscape supply centers, plant nurseries, and botanical tool suppliers within 20 miles of my location that carry: ${itemNames}. Prioritize locations with high expert ratings.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        }
      }
    },
  });

  const stores: StoreResult[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  for (const chunk of groundingChunks) {
    if (chunk.maps) {
      stores.push({
        title: chunk.maps.title || 'Specialized Botanical Supplier',
        uri: chunk.maps.uri,
      });
    }
  }

  return stores;
};
