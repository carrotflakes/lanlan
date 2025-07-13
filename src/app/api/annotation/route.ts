import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, language, explanationLanguage } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!language) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }

    if (!explanationLanguage) {
      return NextResponse.json({ error: 'Explanation language is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash-lite-preview-06-17",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            annotations: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  word: {
                    type: SchemaType.STRING,
                    description: "The word or phrase"
                  },
                  explanation: {
                    type: SchemaType.STRING,
                    description: "Explanation or definition of the word/phrase"
                  }
                },
                required: ["word", "explanation"]
              },
              description: "Important words, phrases, and idiomatic expressions with explanations"
            }
          },
          required: ["annotations"]
        }
      }
    });

    const prompt = `You are an assistant for language learners. The user is learning ${language} and needs help understanding important words and idioms in the text provided. Your task is to analyze the text and extract key words, phrases, and idiomatic expressions.

For each important word, phrase, or idiom, provide:
1. The word/phrase exactly as it appears in the original text (preserve the exact form, conjugation, and inflection)
2. A brief explanation or definition in ${explanationLanguage}

Include important nouns, adjectives, content words, and idiomatic expressions or phrases that would be helpful for language learners. Keep the extracted words in their original form as they appear in the text.

Text to analyze: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    const parsedResponse = JSON.parse(responseText);
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with Gemini API' }, { status: 500 });
  }
}