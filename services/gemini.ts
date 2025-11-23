/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const GEMINI_MODEL = 'gemini-2.5-flash';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COACH_SYSTEM_INSTRUCTION = `You are an elite Running Coach and Sports Scientist for the app "UNITED RUNNERS". 
Your goal is to generate personalized, structured running training plans in RUSSIAN language.
Output format must be clean HTML (<div>, <ul>, <li>, <p>, <h3>) with Tailwind CSS classes for styling.
Use a dark mode theme (text-zinc-300, headings text-white, accents in emerald-400 or blue-400).
Do not output markdown code blocks. Start directly with the HTML.`;

export async function generateTrainingPlan(userLevel: string, goal: string, daysPerWeek: number): Promise<string> {
  const prompt = `Create a 1-week sample training plan for a ${userLevel} runner whose goal is "${goal}". They can train ${daysPerWeek} days a week.
  
  Language: Russian.
  
  Structure the response as a list of daily cards. 
  Include:
  - Day of week
  - Workout type (Recovery, Tempo, Long Run, Intervals, Rest)
  - Specific details (distances, paces)
  - A brief motivation tip.
  
  Style it with Tailwind CSS suitable for a dark, minimalist app. Use 'bg-zinc-900', 'border-zinc-800' etc.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    let text = response.text || "<p class='text-red-400'>Не удалось создать план.</p>";
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Coach Error:", error);
    return `<div class="p-4 bg-red-900/20 border border-red-800 text-red-200 rounded-lg">
      Не удалось связаться с AI тренером. Пожалуйста, проверьте соединение.
    </div>`;
  }
}