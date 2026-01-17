import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  private readonly MODEL_ID = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async predictNextLine(currentText: string): Promise<string> {
    if (!currentText || currentText.length < 10) return '';
    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_ID,
        contents: `You are an autocomplete assistant for professional interview experiences.
        The user is typing: "${currentText}".
        Predict the next sentence to complete the thought. Keep it professional and concise. Return ONLY the predicted text sentence.`,
      });
      return response.text.trim();
    } catch (e) {
      console.error('AI Prediction error', e);
      return '';
    }
  }

  async improveText(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_ID,
        contents: `Improve the following interview experience description to be more professional, clear, and engaging.
        Keep the tone authentic but fix grammar and flow.
        Original Text: "${text}"
        Return ONLY the improved text, no intro/outro.`,
      });
      return response.text.trim();
    } catch (e) {
      console.error('AI Improvement error', e);
      return text;
    }
  }

  async summarizeCompany(posts: string[], companyName: string): Promise<string> {
    try {
      const combinedText = posts.join('\n---\n');
      const response = await this.ai.models.generateContent({
        model: this.MODEL_ID,
        contents: `Analyze these interview experiences for ${companyName}:
        ${combinedText}
        Provide a concise summary (max 3 bullet points) covering:
        1. Common interview difficulty.
        2. Frequently asked topics.
        3. General candidate sentiment.
        Return formatted HTML (ul/li).`,
      });
      return response.text;
    } catch (e) {
      return 'Could not generate summary at this time.';
    }
  }
}