import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json({ error: 'Text, sourceLanguage, and targetLanguage are required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite-preview-06-17" });

    const prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}, respond only with the translated text:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Gemini Translation API Error:', error);
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
  }
}