import { GoogleGenAI, Type } from "@google/genai";
import type { Chat as GenAIChat, Content } from "@google/genai";

export interface Chat {
  internalChat: GenAIChat;
  history: Content[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

class GeminiService {
  /**
   * Generates text from a given prompt.
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return response.text;
    } catch (error) {
      console.error("Error in generateText:", error);
      throw new Error(
        `Failed to generate text: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Generates text from a prompt and an image.
   */
  async generateTextWithImage(
    prompt: string,
    imageBase64: string,
    mimeType: string,
  ): Promise<string> {
    try {
      const imagePart = {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      };
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [imagePart, textPart] }],
      });
      return response.text;
    } catch (error) {
      console.error("Error in generateTextWithImage:", error);
      throw new Error(
        `Failed to analyze image: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Generates a JSON response based on a prompt and a predefined schema.
   */
  async generateJson(prompt: string): Promise<object> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                recipeName: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
          },
        },
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error in generateJson:", error);
      throw new Error(
        `Failed to generate JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Generates text in a streaming fashion.
   */
  async generateTextStream(
    prompt: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      for await (const chunk of responseStream) {
        onChunk(chunk.text);
      }
    } catch (error) {
      console.error("Error in generateTextStream:", error);
      throw new Error(
        `Failed to stream text: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Starts a new chat session.
   */
  async startChat(): Promise<Chat> {
    return {
      internalChat: ai.chats.create({ model: "gemini-2.5-flash" }),
      history: [],
    };
  }

  /**
   * Sends a message in an existing chat session and receives a streaming response.
   */
  async sendMessageStream(
    chat: Chat,
    message: string,
    onChunk: (chunk: string) => void,
  ): Promise<Chat> {
    try {
      const stream = await chat.internalChat.sendMessageStream({ message });
      let fullResponse = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        onChunk(chunkText);
        fullResponse += chunkText;
      }

      const updatedHistory: Content[] = [
        ...chat.history,
        { role: "user", parts: [{ text: message }] },
        { role: "model", parts: [{ text: fullResponse }] },
      ];

      return { ...chat, history: updatedHistory };
    } catch (error) {
      console.error("Error in sendMessageStream:", error);
      throw new Error(
        `Failed to send chat message: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Uses Google Search for grounding to answer questions about recent events.
   */
  async searchWithGoogle(
    prompt: string,
  ): Promise<{ text: string; chunks: GroundingChunk[] }> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text: response.text, chunks: chunks as GroundingChunk[] };
    } catch (error) {
      console.error("Error in searchWithGoogle:", error);
      throw new Error(
        `Failed to search with Google: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export const geminiService = new GeminiService();
